import { ImageResponse } from "next/og";
import { CLINIC } from "@/lib/clinic";

export const runtime = "edge";
export const alt = `${CLINIC.name} — ${CLINIC.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundImage: "linear-gradient(120deg, #3e2c1c 0%, #7a4e2d 45%, #c96f4a 100%)",
          color: "#f5efe6",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "rgba(245,239,230,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            VV
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5 }}>
            {CLINIC.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              letterSpacing: -4,
              lineHeight: 0.95,
              maxWidth: 1040,
            }}
          >
            Vétérinaire<br />du Vully.
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 28,
              fontStyle: "italic",
              color: "rgba(245,239,230,0.85)",
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            {CLINIC.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "rgba(245,239,230,0.7)",
          }}
        >
          <div>{CLINIC.address.city} · {CLINIC.address.countryName}</div>
          <div>{CLINIC.url.replace("https://", "")}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
