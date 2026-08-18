import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/ow-couture-logo.png"
      alt="OW Couture"
      width={768}
      height={768}
      priority={priority}
      className={className}
    />
  );
}
