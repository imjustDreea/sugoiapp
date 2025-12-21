import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function PixelSvg({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      role="img"
      aria-hidden="true"
      shapeRendering="crispEdges"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PixelUserIcon(props: IconProps) {
  return (
    <PixelSvg {...props}>
      {/* head */}
      <rect x="6" y="3" width="4" height="4" fill="currentColor" />
      {/* neck */}
      <rect x="7" y="7" width="2" height="1" fill="currentColor" />
      {/* shoulders/body */}
      <rect x="4" y="8" width="8" height="5" fill="currentColor" />
      {/* cutouts */}
      <rect x="5" y="9" width="6" height="3" fill="black" opacity="0.25" />
    </PixelSvg>
  );
}

export function PixelMailIcon(props: IconProps) {
  return (
    <PixelSvg {...props}>
      {/* envelope */}
      <rect x="3" y="5" width="10" height="7" fill="currentColor" />
      <rect x="4" y="6" width="8" height="5" fill="black" opacity="0.25" />
      {/* flap */}
      <rect x="4" y="6" width="1" height="1" fill="currentColor" />
      <rect x="5" y="7" width="1" height="1" fill="currentColor" />
      <rect x="6" y="8" width="1" height="1" fill="currentColor" />
      <rect x="7" y="9" width="2" height="1" fill="currentColor" />
      <rect x="9" y="8" width="1" height="1" fill="currentColor" />
      <rect x="10" y="7" width="1" height="1" fill="currentColor" />
      <rect x="11" y="6" width="1" height="1" fill="currentColor" />
    </PixelSvg>
  );
}

export function PixelCalendarIcon(props: IconProps) {
  return (
    <PixelSvg {...props}>
      {/* frame */}
      <rect x="3" y="4" width="10" height="9" fill="currentColor" />
      <rect x="4" y="6" width="8" height="6" fill="black" opacity="0.25" />
      {/* rings */}
      <rect x="5" y="3" width="2" height="2" fill="currentColor" />
      <rect x="9" y="3" width="2" height="2" fill="currentColor" />
      {/* header bar */}
      <rect x="4" y="5" width="8" height="1" fill="black" opacity="0.35" />
    </PixelSvg>
  );
}

export function PixelLockIcon(props: IconProps) {
  return (
    <PixelSvg {...props}>
      {/* shackle */}
      <rect x="5" y="4" width="6" height="3" fill="currentColor" />
      <rect x="6" y="5" width="4" height="2" fill="black" opacity="0.25" />
      {/* body */}
      <rect x="4" y="7" width="8" height="6" fill="currentColor" />
      {/* keyhole */}
      <rect x="7" y="9" width="2" height="2" fill="black" opacity="0.35" />
    </PixelSvg>
  );
}

export function PixelEyeIcon(props: IconProps) {
  return (
    <PixelSvg {...props}>
      {/* eye outline */}
      <rect x="3" y="7" width="10" height="2" fill="currentColor" />
      <rect x="4" y="6" width="8" height="1" fill="currentColor" />
      <rect x="4" y="9" width="8" height="1" fill="currentColor" />
      {/* pupil */}
      <rect x="7" y="7" width="2" height="2" fill="black" opacity="0.35" />
    </PixelSvg>
  );
}

export function PixelEyeOffIcon(props: IconProps) {
  return (
    <PixelSvg {...props}>
      {/* eye */}
      <rect x="3" y="7" width="10" height="2" fill="currentColor" />
      <rect x="4" y="6" width="8" height="1" fill="currentColor" />
      <rect x="4" y="9" width="8" height="1" fill="currentColor" />
      {/* slash */}
      <rect x="4" y="11" width="1" height="1" fill="currentColor" />
      <rect x="5" y="10" width="1" height="1" fill="currentColor" />
      <rect x="6" y="9" width="1" height="1" fill="currentColor" />
      <rect x="7" y="8" width="1" height="1" fill="currentColor" />
      <rect x="8" y="7" width="1" height="1" fill="currentColor" />
      <rect x="9" y="6" width="1" height="1" fill="currentColor" />
      <rect x="10" y="5" width="1" height="1" fill="currentColor" />
      <rect x="11" y="4" width="1" height="1" fill="currentColor" />
    </PixelSvg>
  );
}
