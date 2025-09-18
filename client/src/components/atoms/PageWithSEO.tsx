import React from 'react';
import SEOMetadata from './SEOMetadata';
import { useSEO } from '../../hooks/useSEO';

interface PageWithSEOProps {
    title: string;
    description?: string;
    keywords?: readonly string[];
    children: React.ReactNode;
    structuredDataType?:
        | 'WebApplication'
        | 'Organization'
        | 'LocalBusiness'
        | 'MedicalBusiness';
}

/**
 * Higher-Order Component that adds SEO metadata to any page
 *
 * This component leverages React 19's native metadata support to automatically
 * add SEO tags to any page without modifying the page component directly.
 *
 * Usage:
 * ```tsx
 * const MyPage = () => (
 *   <PageWithSEO title="My Page" description="Page description">
 *     <div>Page content...</div>
 *   </PageWithSEO>
 * );
 * ```
 */
const PageWithSEO: React.FC<PageWithSEOProps> = ({
    title,
    description,
    keywords = [],
    children,
    structuredDataType = 'WebApplication',
}) => {
    const seoData = useSEO({
        title,
        description,
        keywords,
        structuredDataType,
        preloadFonts: true,
    });

    return (
        <>
            {/* SEO Metadata - React 19 will hoist to <head> */}
            <SEOMetadata {...seoData} />
            {children}
        </>
    );
};

export default PageWithSEO;
