import React from "react";

interface Props {
  src: string | null;
  alt: string;
  className: string;
  sizes?: string;
}

/** Port photo, or a grey placeholder of the same size when the port has none. */
const PortImage = ({ src, alt, className, sizes }: Props) => {
  if (!src) {
    return (
      <div
        role='img'
        aria-label={alt}
        className={`${className} aspect-4/3 bg-gray-200`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      className={className}
    />
  );
};

export default PortImage;
