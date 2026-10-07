import Image from "next/image";
import { z } from "zod";
import { Container } from "../primitives/container";
import { defineSection } from "./define";

const CTA_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 " +
  "bg-accent text-accent-contrast shadow-sm hover:shadow-md " +
  "font-body text-base leading-none font-medium transition " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * The page's opening Section and its only `<h1>`.
 *
 * The Hero is the LCP element: eager, high fetch priority, explicit dimensions,
 * a reserved aspect ratio and a blur placeholder from Content (computed at
 * upload in ticket 13; stored as text fields until then). Variants rearrange
 * the same content shape — image, video, or split — rather than inventing a
 * new `type`.
 *
 * Video: poster first. Autoplay only when motion is welcome; under
 * `prefers-reduced-motion: reduce` a second `<video controls>` is shown
 * instead, with no autoplay and a native play control — no client JavaScript.
 */
const contentSchema = z.strictObject({
  heading: z.string().optional(),
  lead: z.string().optional(),
  ctaLabel: z.string().optional(),
  imageSrc: z.string().optional(),
  imageAlt: z.string().optional(),
  imageWidth: z.string().optional(),
  imageHeight: z.string().optional(),
  imageBlurDataUrl: z.string().optional(),
  videoSrc: z.string().optional(),
  posterSrc: z.string().optional(),
});

const propsSchema = z.object({
  /** In-page or absolute target for the CTA. Composition-owned, like CTABand. */
  ctaHref: z.string().min(1).optional(),
});

export const hero = defineSection({
  propsSchema,
  contentSchema,
  variants: ["image", "video", "split"],
  component: ({ props, variant, content }) => {
    if (content.heading === undefined) return null;

    const cta =
      content.ctaLabel === undefined || props.ctaHref === undefined ? null : (
        <p className="mt-8">
          <a href={props.ctaHref} className={CTA_CLASS}>
            {content.ctaLabel}
          </a>
        </p>
      );

    const copy = (
      <div className={variant === "split" ? "py-16 sm:py-24" : "relative z-10 py-24 sm:py-32"}>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {content.heading}
        </h1>
        {content.lead === undefined ? null : (
          <p
            className={
              variant === "split"
                ? "text-text-muted mt-6 max-w-xl text-lg"
                : "mt-6 max-w-xl text-lg text-accent-contrast/90"
            }
          >
            {content.lead}
          </p>
        )}
        {cta}
      </div>
    );

    if (variant === "split") {
      return (
        <div className="bg-surface">
          <Container width="wide">
            <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
              {copy}
              <HeroImage content={content} className="relative aspect-[4/3] w-full overflow-hidden rounded-lg" />
            </div>
          </Container>
        </div>
      );
    }

    if (variant === "video") {
      return (
        <div className="relative isolate flex min-h-[70vh] items-end overflow-hidden">
          <HeroVideo content={content} />
          <div className="absolute inset-0 bg-text/45" aria-hidden="true" />
          <Container width="wide">{copy}</Container>
        </div>
      );
    }

    const width = parseDimension(content.imageWidth);
    const height = parseDimension(content.imageHeight);
    const ratio =
      width !== undefined && height !== undefined ? { aspectRatio: `${width} / ${height}` } : undefined;

    return (
      <div
        className="relative isolate flex min-h-[70vh] items-end overflow-hidden"
        style={ratio}
      >
        <HeroImage
          content={content}
          priority
          fill
          className="absolute inset-0 -z-10"
          objectClassName="object-cover"
        />
        <div className="absolute inset-0 bg-text/45" aria-hidden="true" />
        <Container width="wide">{copy}</Container>
      </div>
    );
  },
});

type MediaContent = z.output<typeof contentSchema>;

function HeroImage({
  content,
  className,
  objectClassName = "object-cover",
  priority = false,
  fill = false,
}: {
  content: MediaContent;
  className: string;
  objectClassName?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const width = parseDimension(content.imageWidth);
  const height = parseDimension(content.imageHeight);
  if (content.imageSrc === undefined || width === undefined || height === undefined) {
    return <div className={`bg-surface-raised ${className}`} aria-hidden="true" />;
  }

  if (fill) {
    return (
      <div className={className}>
        <Image
          src={content.imageSrc}
          alt={content.imageAlt ?? ""}
          fill
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          sizes="100vw"
          placeholder={content.imageBlurDataUrl === undefined ? "empty" : "blur"}
          blurDataURL={content.imageBlurDataUrl}
          className={objectClassName}
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ aspectRatio: `${width} / ${height}` }}>
      <Image
        src={content.imageSrc}
        alt={content.imageAlt ?? ""}
        width={width}
        height={height}
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        sizes="(max-width: 768px) 100vw, 50vw"
        placeholder={content.imageBlurDataUrl === undefined ? "empty" : "blur"}
        blurDataURL={content.imageBlurDataUrl}
        className={`h-full w-full ${objectClassName}`}
      />
    </div>
  );
}

function HeroVideo({ content }: { content: MediaContent }) {
  const poster = content.posterSrc ?? content.imageSrc;
  if (content.videoSrc === undefined) {
    return (
      <HeroImage
        content={content}
        priority
        fill
        className="absolute inset-0 -z-10"
        objectClassName="object-cover"
      />
    );
  }

  return (
    <>
      {/* Motion welcome: poster is the LCP; video autoplays muted underneath. */}
      <video
        className="motion-reduce:hidden absolute inset-0 -z-10 h-full w-full object-cover"
        poster={poster}
        src={content.videoSrc}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        aria-hidden="true"
      />
      {/* Reduced motion: no autoplay; native controls are the play control. */}
      <video
        className="motion-safe:hidden absolute inset-0 -z-10 h-full w-full object-cover"
        poster={poster}
        src={content.videoSrc}
        playsInline
        controls
        preload="none"
      >
        {content.heading}
      </video>
    </>
  );
}

function parseDimension(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
