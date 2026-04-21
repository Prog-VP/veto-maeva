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
          backgroundImage: "linear-gradient(120deg, #3e2c1c 0%, #7a4e2d 45%, #c96f4a 100%)",
          color: "#f5efe6",
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
