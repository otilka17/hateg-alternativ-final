import { Helmet } from "react-helmet-async";

export default function SEO({
  title,
  description,
  preloadImage,
}: {
  title: string;
  description: string;
  preloadImage?: string;
}) {
  const fullTitle = `${title} | Metanoia`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {preloadImage && <link rel="preload" as="image" href={preloadImage} fetchPriority="high" />}
    </Helmet>
  );
}
