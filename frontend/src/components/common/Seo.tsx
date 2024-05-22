import React, { FC } from 'react';
import { Helmet } from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';

const noIndexedTag = {
  name: 'robots',
  content: 'noindex, nofollow',
};

export interface Props {
  metaDescription?: string;
  lang?: string;
  meta?: MetaTagType;
  link?: LinkTagType;
  title?: string;
  indexing?: boolean;
}

const SEO: FC<Props> = ({ metaDescription, lang = 'en', meta = [], link = [], title, indexing = false }) => {
  const { site } = useStaticQuery(
    graphql`
      {
        site {
          siteMetadata {
            author
            description
            title
          }
        }
      }
    `
  );

  const _metaDescription = metaDescription || site.siteMetadata.description;
  const _title = title || site.siteMetadata.title;

  return (
    <Helmet
      htmlAttributes={{ lang }}
      title={_title}
      link={[
        {
          rel: 'icon',
          href: "https://gigaland.on3-step.com/img/logo-light.png",
        },
        ...link,
      ]}
      meta={[
        { name: `description`, content: _metaDescription },
        { property: `og:title`, content: _title },
        {
          property: `keywords`,
          content: 'software, web, design, development, ai',
        },
        { property: `og:description`, content: _metaDescription },
        { property: `og:type`, content: `website` },
        { name: `twitter:card`, content: `summary` },
        { name: `twitter:creator`, content: site.siteMetadata?.author || `` },
        { name: `twitter:title`, content: title || site.siteMetadata.title },
        { name: `twitter:description`, content: metaDescription },
        indexing ? {} : { ...noIndexedTag }, // if indexing true pass empty obj else pass noindexing tag obj
        ...meta,
      ]}
    />
  );
};

export default SEO;

type MetaTagType =
  | React.DetailedHTMLProps<
    React.MetaHTMLAttributes<HTMLMetaElement>,
    HTMLMetaElement
  >[]
  | undefined;
type LinkTagType =
  | React.DetailedHTMLProps<
    React.LinkHTMLAttributes<HTMLLinkElement>,
    HTMLLinkElement
  >[]
  | undefined;
