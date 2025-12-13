import React, { useEffect } from 'react';

interface OrganizationSchema {
    name: string;
    url: string;
    logo?: string;
    description?: string;
}

interface ProductSchema {
    name: string;
    description: string;
    image: string;
    price: number;
    currency?: string;
    availability?: string;
    url: string;
}

interface JobPostingSchema {
    title: string;
    description: string;
    companyName: string;
    location: string;
    employmentType?: string;
    salary?: {
        min?: number;
        max?: number;
        currency?: string;
    };
    datePosted: string;
    url: string;
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface StructuredDataProps {
    type: 'organization' | 'product' | 'jobPosting' | 'breadcrumb';
    data: OrganizationSchema | ProductSchema | JobPostingSchema | BreadcrumbItem[];
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
    useEffect(() => {
        let schema: any = {};

        switch (type) {
            case 'organization':
                const orgData = data as OrganizationSchema;
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: orgData.name,
                    url: orgData.url,
                    logo: orgData.logo,
                    description: orgData.description,
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: 'พะเยา',
                        addressRegion: 'พะเยา',
                        addressCountry: 'TH'
                    }
                };
                break;

            case 'product':
                const productData = data as ProductSchema;
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: productData.name,
                    description: productData.description,
                    image: productData.image,
                    offers: {
                        '@type': 'Offer',
                        price: productData.price,
                        priceCurrency: productData.currency || 'THB',
                        availability: productData.availability || 'https://schema.org/InStock',
                        url: productData.url
                    }
                };
                break;

            case 'jobPosting':
                const jobData = data as JobPostingSchema;
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'JobPosting',
                    title: jobData.title,
                    description: jobData.description,
                    hiringOrganization: {
                        '@type': 'Organization',
                        name: jobData.companyName
                    },
                    jobLocation: {
                        '@type': 'Place',
                        address: {
                            '@type': 'PostalAddress',
                            addressLocality: jobData.location,
                            addressCountry: 'TH'
                        }
                    },
                    employmentType: jobData.employmentType || 'FULL_TIME',
                    datePosted: jobData.datePosted,
                    url: jobData.url
                };

                if (jobData.salary) {
                    schema.baseSalary = {
                        '@type': 'MonetaryAmount',
                        currency: jobData.salary.currency || 'THB',
                        value: {
                            '@type': 'QuantitativeValue',
                            minValue: jobData.salary.min,
                            maxValue: jobData.salary.max,
                            unitText: 'MONTH'
                        }
                    };
                }
                break;

            case 'breadcrumb':
                const breadcrumbData = data as BreadcrumbItem[];
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: breadcrumbData.map((item, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: item.name,
                        item: item.url
                    }))
                };
                break;
        }

        // Create or update script tag
        const scriptId = `structured-data-${type}`;
        let scriptTag = document.getElementById(scriptId) as HTMLScriptElement;

        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = scriptId;
            scriptTag.type = 'application/ld+json';
            document.head.appendChild(scriptTag);
        }

        scriptTag.textContent = JSON.stringify(schema);

        // Cleanup
        return () => {
            const element = document.getElementById(scriptId);
            if (element) {
                element.remove();
            }
        };
    }, [type, data]);

    return null;
};

export default StructuredData;
