import Image from "next/image"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <Image
      src="/favicon-32x32.png"
      alt="HomeState Logo"
      width={size}
      height={size}
      className={className}
    />
  )
} 