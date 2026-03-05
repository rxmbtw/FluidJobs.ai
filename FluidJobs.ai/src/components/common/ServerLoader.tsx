import React from 'react';

const ServerLoader: React.FC = () => {
  return (
    <div>
      <svg id="svg-global" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 94 136" height={136} width={94}>
        <path stroke="#FFFFFF" d="M87.3629 108.433L49.1073 85.3765C47.846 84.6163 45.8009 84.6163 44.5395 85.3765L6.28392 108.433C5.02255 109.194 5.02255 110.426 6.28392 111.187L44.5395 134.243C45.8009 135.004 47.846 135.004 49.1073 134.243L87.3629 111.187C88.6243 110.426 88.6243 109.194 87.3629 108.433Z" id="line-v1" />
        <path stroke="#E0E7FF" d="M91.0928 95.699L49.2899 70.5042C47.9116 69.6734 45.6769 69.6734 44.2986 70.5042L2.49568 95.699C1.11735 96.5298 1.11735 97.8767 2.49568 98.7074L44.2986 123.902C45.6769 124.733 47.9116 124.733 49.2899 123.902L91.0928 98.7074C92.4712 97.8767 92.4712 96.5298 91.0928 95.699Z" id="line-v2" />
        <g id="node-server">
          <path fill="url(#paint0_linear_204_217)" d="M2.48637 72.0059L43.8699 96.9428C45.742 98.0709 48.281 97.8084 50.9284 96.2133L91.4607 71.7833C92.1444 71.2621 92.4197 70.9139 92.5421 70.1257V86.1368C92.5421 86.9686 92.0025 87.9681 91.3123 88.3825C84.502 92.4724 51.6503 112.204 50.0363 113.215C48.2352 114.343 45.3534 114.343 43.5523 113.215C41.9261 112.197 8.55699 91.8662 2.08967 87.926C1.39197 87.5011 1.00946 86.5986 1.00946 85.4058V70.1257C1.11219 70.9289 1.49685 71.3298 2.48637 72.0059Z" />
          <path stroke="url(#paint2_linear_204_217)" fill="url(#paint1_linear_204_217)" d="M91.0928 68.7324L49.2899 43.5375C47.9116 42.7068 45.6769 42.7068 44.2986 43.5375L2.49568 68.7324C1.11735 69.5631 1.11735 70.91 2.49568 71.7407L44.2986 96.9356C45.6769 97.7663 47.9116 97.7663 49.2899 96.9356L91.0928 71.7407C92.4712 70.91 92.4712 69.5631 91.0928 68.7324Z" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" y2="92.0933" x2="92.5421" y1="92.0933" x1="1.00946" id="paint0_linear_204_217">
            <stop stopColor="#FFFFFF" />
            <stop stopColor="#E0E7FF" offset={1} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="91.1638" x2="6.72169" y1={70} x1="92.5" id="paint1_linear_204_217">
            <stop stopColor="#E0E7FF" />
            <stop stopColor="#FFFFFF" offset="0.29" />
            <stop stopColor="#C7DCFF" offset={1} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="85.0762" x2="3.55544" y1={70} x1="92.5" id="paint2_linear_204_217">
            <stop stopColor="#FFFFFF" />
            <stop stopColor="#E8F0FF" offset={1} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default ServerLoader;