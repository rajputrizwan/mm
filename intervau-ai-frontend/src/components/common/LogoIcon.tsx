import React from "react";

export type LogoIconProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  alt?: string;
};

export default function LogoIcon({
  alt = "Intervau.AI",
  className = "",
  ...props
}: LogoIconProps) {
  const mergedClassName = ["object-contain", className]
    .filter(Boolean)
    .join(" ");

  return (
    <img src="/Logo.png" alt={alt} className={mergedClassName} {...props} />
  );
}
