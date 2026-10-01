import { useState } from "react";

// Lista fija de todos los talles posibles del negocio
const TALLES_POSIBLES = ["S", "M", "L", "XL", "XXL"];

function SelectorTalles({ tallesDisponibles = [], onSeleccionar }) { //prop que lleva funcionalidad
  const [talleSeleccionado, setTalleSeleccionado] = useState(null);

  const handleClick = (talle) => {
    setTalleSeleccionado(talle);
    onSeleccionar?.(talle); // avisa al padre si le pasaron una función
  };

  return (
    <div className="mb-4">
      <p className="mb-2" style={{ fontSize: "0.9rem" }}>
        <span style={{ color: "#999", letterSpacing: "0.05em" }}>TALLE: </span>
        <strong style={{ color: "#0d6efd" }}>
          {talleSeleccionado || "—"}
        </strong>
      </p>

      <div className="d-flex gap-2 flex-wrap">
        {TALLES_POSIBLES.map((talle) => {
          const disponible = tallesDisponibles.includes(talle);
          const seleccionado = talleSeleccionado === talle;

          return (
            <button
              key={talle}
              type="button"
              disabled={!disponible}
              onClick={() => handleClick(talle)}
              style={{
                minWidth: "3.5rem",
                padding: "0.6rem 1rem",
                position: "relative",
                background: "white",
                border: seleccionado
                  ? "2px solid #0d6efd"
                  : "1px solid #dee2e6",
                borderRadius: "8px",
                color: disponible ? "#333" : "#bbb",
                fontWeight: 500,
                cursor: disponible ? "pointer" : "not-allowed",
                overflow: "hidden",
                transition: "all 0.15s ease",
              }}
            >
              {talle}

              {!disponible && (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top right, transparent 48%, #ccc 48%, #ccc 52%, transparent 52%)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SelectorTalles;