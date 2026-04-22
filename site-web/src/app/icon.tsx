import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(120deg, #0b2545 0%, #164a82 55%, #1d8bc7 100%)",
          color: "#f3faff",
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: -2,
          fontFamily: "system-ui, sans-serif",
          borderRadius: 14,
        }}
      >
        VV
      </div>
    ),
    { ...size },
  );
}
