import { useState, useEffect } from "react";
import axios from "axios";
import MultiSelect from "./MultiSelect";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "/logo.png";

const API = "http://localhost:5000/api";

export default function SearchPage({ user }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [dropdowns, setDropdowns] = useState({
    areas: [],
    cities: [],
    industries: [],
    skills: [],
    brands: [],
    languages: [],
    market_types: [],
    job_titles: []
  });

  const [minExp, setMinExp] = useState(0);
  const [maxExp, setMaxExp] = useState(30);
  const [useExperience, setUseExperience] = useState(false);

  const [filters, setFilters] = useState({
    areas: [],
    cities: [],
    industries: [],
    skills: [],
    brands: [],
    languages: [],
    market_types: [],
    job_titles: [],
    gender: ""
  });

  /* ================= LOAD ================= */

  useEffect(() => {
    axios.get(`${API}/search/dropdown-options`, {
      headers: {
        Authorization: user.user_id
      }
    })
      .then(res => setDropdowns(res.data))
      .catch(err => {
        console.error("Dropdown fetch error:", err);
        alert("Failed to load dropdown options");
      });
  }, [user]);

  /* ================= SEARCH ================= */

  const handleSearch = async () => {
    setLoading(true);

    try {
      let experienceFilter = {};

      if (useExperience) {
        experienceFilter = {
          min_experience: minExp,
          max_experience: maxExp
        };
      }

      const res = await axios.get(`${API}/search/search-sql`, {
        params: {
          ...filters,
          ...experienceFilter
        },
        headers: {
          Authorization: user.user_id
        }
      });

      setResults(res.data?.results || []);

    } catch (err) {
      console.error(err);
      alert("Search failed: " + err.response?.data?.error || err.message);
    }

    setLoading(false);
  };

  /* ================= DOWNLOAD ================= */

  const downloadExcel = async () => {
    try {
      let experienceFilter = {};

      if (useExperience) {
        experienceFilter = {
          min_experience: minExp,
          max_experience: maxExp,
        };
      }

      const response = await axios.post(
        `${API}/search/sql/export`,
        {
          ...filters,
          ...experienceFilter,
        },
        {
          responseType: "blob",
          headers: {
            Authorization: user.user_id
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "sql_results.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error(error);
      alert("Download failed");
    }
  };

  /* ================= VIEW ================= */

  const handleView = (candidate) => {
    setSelectedCandidate({
      ...candidate,
      resume_link: candidate.resume_link || `/api/download/${candidate.id}`
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  /* ================= MARK INACTIVE ================= */

  const handleMarkInactive = async () => {
    const confirmAction = window.confirm(
      "Are you sure you want to mark this candidate as inactive?"
    );

    if (!confirmAction) return;

    try {
      await axios.post(`${API}/search/candidate/status`, {
        id: selectedCandidate.id,
        status: "inactive"
      }, {
        headers: {
          Authorization: user.user_id
        }
      });

      alert("Candidate marked inactive");

      setResults(prev =>
        prev.filter(c => c.id !== selectedCandidate.id)
      );

      closeModal();

    } catch (err) {
      console.error(err);
      alert("Failed");
    }
  };

  /* ================= HANDLE DOWNLOAD LINK ================= */

  const handleDownload = () => {
    if (!selectedCandidate?.resume_link) {
      alert("Resume not available");
      return;
    }

    window.open(selectedCandidate.resume_link, "_blank");
  };

  /* ================= PARSE ================= */

  const parseJSONField = (field) => {
    if (!field) return "-";

    try {
      if (typeof field === "string" && field.startsWith("[")) {
        return JSON.parse(field).join(", ");
      }
      if (Array.isArray(field)) {
        return field.join(", ");
      }
      return field;
    } catch {
      return field;
    }
  };

  /* ================= UI ================= */

  return (
    <div className="app-wrapper">
      <div className="dashboard-card">
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: "160px", objectFit: "contain" }}
          />
        </div>

        <h2 className="dashboard-header">
          Candidate Resume Search
        </h2>

        {/* EXPERIENCE */}

        <div className="experience-container">
          <label>
            <input
              type="checkbox"
              checked={useExperience}
              onChange={(e) => setUseExperience(e.target.checked)}
            />
            Filter by Experience years
          </label>

          {useExperience && (
            <>
              <p>{minExp} - {maxExp} years</p>

              {/* MIN SLIDER */}
              <label>Min Experience: {minExp} years</label>

              <input
                type="range"
                min="0"
                max="30"
                value={minExp}
                onChange={(e) => {
                  const value = Math.min(Number(e.target.value), maxExp);
                  setMinExp(value);
                }}
              />

              {/* MAX SLIDER */}
              <label style={{ marginLeft: "20px" }}>Max Experience: {maxExp} years</label>
              <input
                type="range"
                min="0"
                max="30"
                value={maxExp}
                onChange={(e) => {
                  const value = Math.max(Number(e.target.value), minExp);
                  setMaxExp(value);
                }}
              />
            </>
          )}
        </div>

        <label>Gender</label>
        <select
          value={filters.gender}
          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
        >
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        {/* ================= FULL FILTERS ================= */}

        <div className="filter-section">

          <MultiSelect label="Areas" options={dropdowns.areas}
            selected={filters.areas}
            onChange={(val) => setFilters({ ...filters, areas: val })}
          />

          <MultiSelect label="Cities" options={dropdowns.cities}
            selected={filters.cities}
            onChange={(val) => setFilters({ ...filters, cities: val })}
          />

          <MultiSelect label="Industries" options={dropdowns.industries}
            selected={filters.industries}
            onChange={(val) => setFilters({ ...filters, industries: val })}
          />

          <MultiSelect label="Skills" options={dropdowns.skills}
            selected={filters.skills}
            onChange={(val) => setFilters({ ...filters, skills: val })}
          />

          <MultiSelect label="Brands & Companies" options={dropdowns.brands}
            selected={filters.brands}
            onChange={(val) => setFilters({ ...filters, brands: val })}
          />

          <MultiSelect label="Languages" options={dropdowns.languages}
            selected={filters.languages}
            onChange={(val) => setFilters({ ...filters, languages: val })}
          />

          <MultiSelect label="Market Type" options={dropdowns.market_types}
            selected={filters.market_types}
            onChange={(val) => setFilters({ ...filters, market_types: val })}
          />

          <MultiSelect label="Job Titles" options={dropdowns.job_titles}
            selected={filters.job_titles}
            onChange={(val) => setFilters({ ...filters, job_titles: val })}
          />

        </div>

        <button onClick={handleSearch}>Search</button>

        {results.length > 0 && (
          <button onClick={downloadExcel}>Download Excel</button>
        )}

        {/* RESULTS */}

        <div>

          {loading && <p>Loading...</p>}

          {results.length > 0 && (
            <table>

              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Experience</th>
                  <th>Skills</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {results.map((r, index) => (

                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.city}</td>
                    <td>{r.experience_years}</td>
                    <td>{parseJSONField(r.skills)}</td>

                    <td>
                      <button onClick={() => handleView(r)}>View</button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          )}

        </div>

        {/* MODAL */}

        {showModal && selectedCandidate && (

          <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>

            <div className="modal-dialog modal-lg">

              <div className="modal-content">

                <div className="modal-header">

                  <h5>Candidate Details</h5>

                  <button onClick={closeModal}>X</button>

                </div>

                <div className="modal-body">

                  <table>

                    <tbody>


                      {Object.entries(selectedCandidate)
                        .filter(([key]) =>
                          !["download_link", "download_resume", "file_path", "resume_link"].includes(key)
                        )
                        .map(([key, value]) => {

                          let display = value;

                          if (Array.isArray(value)) display = value.join(", ");
                          else if (typeof value === "object" && value !== null) display = JSON.stringify(value);

                          return (
                            <tr key={key}>
                              <td>{key}</td>
                              <td>{display?.toString() || "-"}</td>
                            </tr>
                          );
                        })}

                    </tbody>

                  </table>

                </div>

                <div className="modal-footer">

                  {selectedCandidate?.resume_link && (
                    <button
                      className="btn btn-success"
                      onClick={handleDownload}
                    >
                      ⬇ Download Resume
                    </button>
                  )}

                  <button
                    className="btn btn-danger"
                    onClick={handleMarkInactive}
                  >
                    Mark Inactive
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}
