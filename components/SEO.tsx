import React, { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    canonicalUrl?: string;
    noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
    title = 'Phayao Hub | รวมทุกเรื่องราวเพื่อชาวพะเยา',
    description = 'ศูนย์รวมข้อมูลจังหวัดพะเยา รวมสถานที่ท่องเที่ยว สถานที่กินเที่ยวยอดนิยม ตลาดซื้อขายออนไลน์ และหางานในพะเยา - แหล่งรวมชุมชนออนไลน์สำหรับคนพะเยา',
    keywords = 'พะเยา, จังหวัดพะเยา, ท่องเที่ยวพะเยา, ร้านอาหารพะเยา, ที่พักพะเยา, งานพะเยา, ตลาดซื้อขายพะเยา, คอมมิวนิตี้พะเยา, Phayao Hub, กว๊านพะเยา',
    ogImage = 'https://phayaohub.com/og-image.jpg',
    ogType = 'website',
    canonicalUrl,
    noindex = false
}) => {
    useEffect(() => {
        // Update title
        document.title = title;

        // Helper function to update or create meta tag
        const updateMetaTag = (name: string, content: string, property = false) => {
            const attribute = property ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${name}"]`);

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }

            element.setAttribute('content', content);
        };

        // Update meta tags
        updateMetaTag('title', title);
        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);
        updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

        // Update canonical URL
        const siteUrl = 'https://phayaohub.com';
        const fullCanonicalUrl = canonicalUrl || siteUrl + window.location.pathname;

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', fullCanonicalUrl);

        // Open Graph tags
        updateMetaTag('og:type', ogType, true);
        updateMetaTag('og:url', fullCanonicalUrl, true);
        updateMetaTag('og:title', title, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:image', ogImage, true);

        // Twitter tags
        updateMetaTag('twitter:card', 'summary_large_image', true);
        updateMetaTag('twitter:url', fullCanonicalUrl, true);
        updateMetaTag('twitter:title', title, true);
        updateMetaTag('twitter:description', description, true);
        updateMetaTag('twitter:image', ogImage, true);
    }, [title, description, keywords, ogImage, ogType, canonicalUrl, noindex]);

    return null;
};

export default SEO;
