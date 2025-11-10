import React from 'react';
import FooterColumn from './FooterColumn';

const productLinks = [
    { name: "For Candidates", href: "#" },
    { name: "For Employers", href: "#" },
    { name: "Pricing", href: "#" },
];
const companyLinks = [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Blog", href: "#" },
];
const resourcesLinks = [
    { name: "Documentation", href: "#" },
    { name: "Support", href: "#" },
    { name: "Contact", href: "#" },
];
const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
];

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-16 px-4 border-t border-gray-800">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8">
        <FooterColumn title="Product" links={productLinks} />
        <FooterColumn title="Company" links={companyLinks} />
        <FooterColumn title="Resources" links={resourcesLinks} />
        <FooterColumn title="Legal" links={legalLinks} />
      </div>
      <div className="mt-16 text-center text-gray-500">
        &copy; 2025 FluidJobs.ai, Inc. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
