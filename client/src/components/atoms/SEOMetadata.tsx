import React from 'react';

interface SEOMetadataProps {
    title: string;
    description?: string;
    keywords?: string;
    author?: string;
    robots?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile';
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterSite?: string;
    twitterCreator?: string;
    structuredData?: object;
    preloadResources?: Array<{
        href: string;
        as: 'script' | 'style' | 'font' | 'image';
        type?: string;
        crossorigin?: 'anonymous' | 'use-credentials';
    }>;
}

/**
 * SEOMetadata Component
 *
 * Leverages React 19's native metadata support to automatically hoist
 * title, meta, and link tags to the document head for improved SEO.
 *
 * Features:
 * - Automatic head hoisting (React 19)
 * - Open Graph meta tags for social sharing
 * - Twitter Card meta tags
 * - Structured data (JSON-LD) support
 * - Resource preloading for performance
 * - Canonical URL for duplicate content prevention
 */
const SEOMetadata: React.FC<SEOMetadataProps> = ({
    title,
    description,
    keywords,
    author = 'PharmCare Management System',
    robots = 'index, follow',
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    twitterSite,
    twitterCreator,
    structuredData,
    preloadResources = [],
}) => {
    // Create the full page title with app name
    const fullTitle = title.includes('PharmCare')
        ? title
        : `${title} | PharmCare Management System`;

    // Use Open Graph values or fallback to regular values
    const finalOgTitle = ogTitle || title;
    const finalOgDescription = ogDescription || description;

    return (
        <>
            {/* Page Title - React 19 will hoist this to <head> */}
            <title>{fullTitle}</title>

            {/* Basic Meta Tags */}
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="author" content={author} />
            <meta name="robots" content={robots} />

            {/* Viewport and charset are usually set in index.html, but can be overridden */}
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
            <meta charSet="utf-8" />

            {/* Canonical URL */}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={finalOgTitle} />
            {finalOgDescription && (
                <meta property="og:description" content={finalOgDescription} />
            )}
            <meta property="og:type" content={ogType} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta
                property="og:site_name"
                content="PharmCare Management System"
            />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={finalOgTitle} />
            {finalOgDescription && (
                <meta name="twitter:description" content={finalOgDescription} />
            )}
            {ogImage && <meta name="twitter:image" content={ogImage} />}
            {twitterSite && <meta name="twitter:site" content={twitterSite} />}
            {twitterCreator && (
                <meta name="twitter:creator" content={twitterCreator} />
            )}

            {/* PWA Meta Tags */}
            <meta name="application-name" content="PharmCare" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta
                name="apple-mobile-web-app-status-bar-style"
                content="default"
            />
            <meta name="apple-mobile-web-app-title" content="PharmCare" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="theme-color" content="#3b82f6" />

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script
                    type="application/ld+json"
                    // Safely serialize structured data and escape closing script tags
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData).replace(
                            /<\/script/gi,
                            '<\\/script',
                        ),
                    }}
                />
            )}

            {/* Resource Preloading - React 19 will optimize these */}
            {preloadResources.map((resource, index) => (
                <link
                    key={index}
                    rel="preload"
                    href={resource.href}
                    as={resource.as}
                    type={resource.type}
                    crossOrigin={resource.crossorigin}
                />
            ))}

            {/* DNS Prefetch for external resources */}
            <link rel="dns-prefetch" href="//fonts.googleapis.com" />
            <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        </>
    );
};

export default SEOMetadata;
