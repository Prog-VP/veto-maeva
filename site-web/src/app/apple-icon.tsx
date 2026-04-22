import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 100,
          fontWeight: 900,
          letterSpacing: -5,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        VV
      </div>
    ),
    { ...size },
  );
}
