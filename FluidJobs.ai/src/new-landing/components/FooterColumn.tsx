import React from 'react';

interface Link {
  name: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: Link[];
}

const FooterColumn: React.FC<FooterColumnProps> = ({ title, links }) => {
  return (
    <div>
      <h4 className="text-white font-semibold mb-4">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <a href={link.href} className="text-gray-400 hover:text-white">
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterColumn;
