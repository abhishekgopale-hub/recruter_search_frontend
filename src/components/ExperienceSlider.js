import React from "react";
import { Range, getTrackBackground } from "react-range";
import "./ExperienceSlider.css";

const STEP = 1;
const MIN = 0;
const MAX = 30;

function ExperienceSlider({
  minValue,
  maxValue,
  setMinValue,
  setMaxValue
}) {

  const values = [minValue, maxValue];

  return (
    <div className="exp-slider">
      <div className="exp-label">
        Experience: <strong>{values[0]} - {values[1]} yrs</strong>
      </div>

      <Range
        values={values}
        step={STEP}
        min={MIN}
        max={MAX}
        onChange={(vals) => {
          setMinValue(vals[0]);
          setMaxValue(vals[1]);
        }}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="range-track"
            style={{
              height: "10px",
              width: "100%",
              borderRadius: "10px",
              background: getTrackBackground({
                values,
                colors: ["#ddd", "#6c63ff", "#ddd"],
                min: MIN,
                max: MAX
              })
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            style={{
              height: "20px",
              width: "20px",
              borderRadius: "50%",
              backgroundColor: "#6c63ff"
            }}
          />
        )}
      />
    </div>
  );
}

export default ExperienceSlider;