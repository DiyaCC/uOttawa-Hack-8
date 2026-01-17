import ImageSelectionCard from "../components/ImageSelectionCard";
import QuestionCard from "../components/QuestionCard";
import PersonalInfoCard from "../components/PersonalInfoCard";
import { useEffect, useMemo, useState } from "react";
import "../css/Home.css";

const SURVEY_QUESTIONS = [
  {
    id: 1,
    text: "How was your overall experience?",
    category: "tree", // Map to your API categories
    images: [
      "/images/tree_1.png",
      "/images/tree_2.png",
      "/images/tree_3.png",
      "/images/tree_4.png",
      "/images/tree_5.png",
    ],
  },
  {
    id: 2,
    text: "How likely are you to recommend us?",
    category: "sky",
    images: [
      "/images/tree_1.png",
      "/images/tree_2.png",
      "/images/tree_3.png",
      "/images/tree_4.png",
      "/images/tree_5.png",
    ],
  },
  {
    id: 3,
    text: "How was the speed of service?",
    category: "mountain",
    images: [
      "/images/Tree1.png",
      "/images/Tree2.png",
      "/images/Tree3.png",
      "/images/Tree4.png",
      "/images/Tree5.png",
    ],
  },
  {
    id: 4,
    text: "How was your overall experience?",
    category: "flower",
    images: [
      "/images/Tree1.png",
      "/images/Tree2.png",
      "/images/Tree3.png",
      "/images/Tree4.png",
      "/images/Tree5.png",
    ],
  },
  {
    id: 5,
    text: "How likely are you to recommend us?",
    category: "water",
    images: [
      "/images/Tree1.png",
      "/images/Tree2.png",
      "/images/Tree3.png",
      "/images/Tree4.png",
      "/images/Tree5.png",
    ],
  },
  {
    id: 6,
    text: "How was the speed of service?",
    category: "cloud",
    images: [
      "/images/Tree1.png",
      "/images/Tree2.png",
      "/images/Tree3.png",
      "/images/Tree4.png",
      "/images/Tree5.png",
    ],
  },
  {
    id: 7,
    text: "How was your overall experience?",
    category: "sun",
    images: [
      "/images/Tree1.png",
      "/images/Tree2.png",
      "/images/Tree3.png",
      "/images/Tree4.png",
      "/images/Tree5.png",
    ],
  },
  {
    id: 8,
    text: "How likely are you to recommend us?",
    category: "grass",
    images: [
      "/images/Tree1.png",
      "/images/Tree2.png",
      "/images/Tree3.png",
      "/images/Tree4.png",
      "/images/Tree5.png",
    ],
  },
  {
    id: 9,
    text: "How was the speed of service?",
    category: "bird",
    images: [
      "/images/Tree1.png",
      "/images/Tree2.png",
      "/images/Tree3.png",
      "/images/Tree4.png",
      "/images/Tree5.png",
    ],
  },
];

const ANIM_MS = 720;
const API_BASE_URL = "http://localhost:8000"; // Change to your backend URL

export default function Home() {
  const total = SURVEY_QUESTIONS.length;
  const last = total - 1;

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | leaving | entering
  const [dir, setDir] = useState("next"); // next | prev

  const [saved, setSaved] = useState(() => Array(total).fill(null));
  const [picked, setPicked] = useState(null); // current question selection (not yet saved unless OK/Save)

  // New states for API and image display
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const q = SURVEY_QUESTIONS[idx];

  useEffect(() => {
    setPicked(saved[idx] ?? null);
  }, [idx, saved]);

  const busy = phase !== "idle";
  const canPrev = idx > 0 && !busy;
  const canNext = !busy && Boolean(picked);

  const answered = useMemo(() => saved.filter(Boolean).length, [saved]);

  const commit = () => {
    if (!picked) return;
    setSaved((prev) => {
      const next = prev.slice();
      next[idx] = picked;
      return next;
    });
  };

  const go = (nextIdx, nextDir) => {
    if (busy) return;
    setDir(nextDir);
    setPhase("leaving");

    window.setTimeout(() => {
      setIdx(nextIdx);
      setPhase("entering");
      window.setTimeout(() => setPhase("idle"), ANIM_MS);
    }, ANIM_MS);
  };

  // Extract score from image path (e.g., "/images/tree_3.png" -> 3)
  const getScoreFromImagePath = (imagePath) => {
    if (!imagePath) return null;
    const match = imagePath.match(/(\d+)\.png$/);
    return match ? parseInt(match[1]) : null;
  };

  // Prepare survey data for API

  // Handle submission to API

  const handleSubmitWithData = async (savedData) => {
    console.log("SENDING");
    setIsLoading(true);

    try {
      const surveyData = SURVEY_QUESTIONS.map((question, index) => {
        const selectedImage = savedData[index];
        const score = getScoreFromImagePath(selectedImage);
        return {
          category: question.category,
          score: score || 1,
        };
      });

      console.log("Sending survey data:", surveyData);

      const response = await fetch(`${API_BASE_URL}/generate-landscape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate landscape");
      }

      const result = await response.json();
      console.log("API response:", result);

      const imageUrl = `${API_BASE_URL}${result.final_image_path}`;
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error("Error generating landscape:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onNext = () => {
    console.log("NEXT");
    if (!canNext) return;

    if (idx === last) {
      // On the last question, commit the answer first
      const updatedSaved = saved.slice();
      updatedSaved[idx] = picked;
      setSaved(updatedSaved);

      // Then submit with the complete data
      handleSubmitWithData(updatedSaved);
      return;
    }

    commit();
    go(idx + 1, "next");
  };

  const onPrev = () => {
    if (!canPrev) return;
    go(idx - 1, "prev");
  };

  const onClear = () => {
    setIdx(0);
    setPhase("idle");
    setDir("next");
    setSaved(Array(total).fill(null));
    setPicked(null);
    setGeneratedImageUrl(null);
  };

  // Show PersonalInfoCard if image is generated
  if (generatedImageUrl) {
    return <PersonalInfoCard backgroundImage={generatedImageUrl} />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <h2>Generating your landscape...</h2>
        <p>This may take a moment</p>
      </div>
    );
  }

  return (
    <div className="homePage">
      <div className="homeLayout">
        {/* LEFT: Question stage + buttons (buttons are NOT part of stage height) */}
        <section className="surveyArea">
          <div className="stageViewport" aria-live="polite">
            <div className={`stageMotion ${phase} ${dir}`}>
              <QuestionCard
                key={q.id}
                question={q.text}
                imageSelectionCard={
                  <ImageSelectionCard
                    img1={q.images[0]}
                    img2={q.images[1]}
                    img3={q.images[2]}
                    img4={q.images[3]}
                    img5={q.images[4]}
                    value={picked}
                    onSelectionChange={setPicked}
                  />
                }
              />
            </div>
          </div>

          <div className="actions">
            <div className="actionsRow">
              <button className="btn secondary" type="button" onClick={onClear}>
                Clear Form
              </button>

              <div className="navGroup">
                <button
                  className="btn secondary"
                  type="button"
                  onClick={onPrev}
                  disabled={!canPrev}
                >
                  Previous
                </button>

                <button
                  className="btn primary"
                  type="button"
                  onClick={onNext}
                  disabled={!canNext}
                  title={!picked ? "Pick an image first" : ""}
                >
                  {idx === last ? "Submit" : "OK"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Shelf equals stage height and aligns horizontally */}
        <aside className="shelfPanel" aria-label="Selections shelf">
          <header className="shelfHeader">
            <div className="shelfTitle">Landscape Shelf</div>
            <div className="shelfMeta">
              Saved: <b>{answered}</b> / {total}
            </div>
          </header>

          <div className="shelfGrid" role="list">
            {saved.map((src, i) => (
              <div
                key={i}
                className={`shelfItem ${src ? "has" : ""}`}
                role="listitem"
              >
                <div className="shelfItemTop">
                  <div className="shelfQ">Q{i + 1}</div>
                  <div className={`shelfStatus ${src ? "done" : ""}`}>
                    {src ? "Selected" : "Empty"}
                  </div>
                </div>

                <div className="shelfThumb">
                  {src ? (
                    <img src={src} alt={`Selection for question ${i + 1}`} />
                  ) : (
                    <div className="shelfThumbEmpty">—</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
