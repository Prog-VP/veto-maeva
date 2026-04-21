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
          backgroundImage: "linear-gradient(120deg, #3e2c1c 0%, #7a4e2d 45%, #c96f4a 100%)",
          color: "#f5efe6",
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
