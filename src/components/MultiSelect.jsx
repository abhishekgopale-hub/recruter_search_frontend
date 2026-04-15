import { useState, useRef, useEffect } from "react";
import "./MultiSelect.css";

function MultiSelect({ label, options = [], selected = [], onChange }) {

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef();

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  const toggleOption = (option) => {

    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }

  };

  const removeChip = (option) => {
    onChange(selected.filter(item => item !== option));
  };

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div className="multi-wrapper" ref={dropdownRef}>

      <label>{label}</label>

      <div
        className="multi-control"
        onClick={() => setOpen(!open)}
      >

        {selected.length === 0 && (
          <span className="multi-placeholder">
            Select {label}
          </span>
        )}

        <div className="chip-container">

          {selected.map((item, index) => (

            <div key={index} className="chip">

              {item}

              <span
                className="chip-remove"
                onClick={(e)=>{
                  e.stopPropagation();
                  removeChip(item);
                }}
              >
                ×
              </span>

            </div>

          ))}

        </div>

        <span className="arrow">▾</span>

      </div>

      {open && (

        <div className="multi-dropdown">

          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />

          <div className="options-list">

            {filteredOptions.map((option, idx)=>(
              <label key={idx} className="option-item">

                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={()=>toggleOption(option)}
                />

                {option}

              </label>
            ))}

          </div>

        </div>

      )}

    </div>

  );

}

export default MultiSelect;