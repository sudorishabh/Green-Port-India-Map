import React from "react";

interface Props {
  src: string;
  alt: string;
  className: string;
  sizes?: string;
}

const PortImage = ({ src, alt, className, sizes }: Props) => {
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
