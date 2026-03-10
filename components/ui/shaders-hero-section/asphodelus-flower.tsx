type AsphodelusFlowerProps = {
  className?: string;
};

export function AsphodelusFlower({ className }: AsphodelusFlowerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="120"
      height="120"
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flower-og" x1=".5" y1="1" x2=".5" y2="0">
          <stop offset="0%" stopColor="#EE740C" />
          <stop offset="100%" stopColor="#FFECD2" />
        </linearGradient>
        <linearGradient id="flower-ig" x1=".5" y1="1" x2=".5" y2="0">
          <stop offset="20%" stopColor="#D4660A" />
          <stop offset="100%" stopColor="#FFDAB9" />
        </linearGradient>
        <radialGradient id="flower-gw">
          <stop offset="0%" stopColor="#EE740C" stopOpacity=".22" />
          <stop offset="70%" stopColor="#EE740C" stopOpacity="0" />
        </radialGradient>
      </defs>

      <style>
        {`
          .gl{opacity:0;animation:g 6s ease-in-out infinite}
          .op{transform-origin:60px 60px;opacity:0;animation:bo 6s ease-in-out infinite}
          .ip{transform-origin:60px 60px;opacity:0;animation:bi 6s ease-in-out infinite}
          .st{transform-box:fill-box;transform-origin:center;opacity:0;animation:bs 6s ease-in-out infinite}
          .pi{transform-box:fill-box;transform-origin:center;opacity:0;animation:bp 6s ease-in-out infinite}

          .d0{animation-delay:0s}.d1{animation-delay:.07s}.d2{animation-delay:.14s}
          .d3{animation-delay:.21s}.d4{animation-delay:.28s}.d5{animation-delay:.35s}
          .i0{animation-delay:.16s}.i1{animation-delay:.23s}.i2{animation-delay:.3s}
          .i3{animation-delay:.37s}.i4{animation-delay:.44s}.i5{animation-delay:.51s}
          .s0{animation-delay:.48s}.s1{animation-delay:.53s}.s2{animation-delay:.58s}
          .s3{animation-delay:.63s}.s4{animation-delay:.68s}.p0{animation-delay:.5s}

          @keyframes g{
            0%,8%{opacity:0}22%,68%{opacity:1}88%,100%{opacity:0}
          }
          @keyframes bo{
            0%,8%{transform:scaleY(0);opacity:0}
            20%{transform:scaleY(1.08);opacity:1}
            24%{transform:scaleY(.97)}
            28%,42%{transform:scaleY(1);opacity:1}
            46%{transform:scaleY(1.04)}
            56%{transform:scaleY(.98)}
            68%{transform:scaleY(1);opacity:1}
            85%,100%{transform:scaleY(0);opacity:0}
          }
          @keyframes bi{
            0%,10%{transform:scaleY(0);opacity:0}
            24%{transform:scaleY(1.06);opacity:.85}
            28%{transform:scaleY(.98)}
            32%{transform:scaleY(1);opacity:.85}
            46%{transform:scaleY(1.03)}
            58%{transform:scaleY(.98)}
            68%{transform:scaleY(1);opacity:.85}
            82%,100%{transform:scaleY(0);opacity:0}
          }
          @keyframes bs{
            0%,18%{transform:scale(0);opacity:0}
            30%{transform:scale(1.15);opacity:1}
            34%,62%{transform:scale(1);opacity:1}
            78%,100%{transform:scale(0);opacity:0}
          }
          @keyframes bp{
            0%,20%{transform:scale(0);opacity:0}
            32%{transform:scale(1.2);opacity:1}
            36%,60%{transform:scale(1);opacity:1}
            76%,100%{transform:scale(0);opacity:0}
          }
        `}
      </style>

      <circle className="gl" cx="60" cy="60" r="50" fill="url(#flower-gw)" />

      <g transform="rotate(0,60,60)">
        <ellipse className="op d0" cx="60" cy="40" rx="7" ry="20" fill="url(#flower-og)" />
      </g>
      <g transform="rotate(60,60,60)">
        <ellipse className="op d1" cx="60" cy="40" rx="7" ry="20" fill="url(#flower-og)" />
      </g>
      <g transform="rotate(120,60,60)">
        <ellipse className="op d2" cx="60" cy="40" rx="7" ry="20" fill="url(#flower-og)" />
      </g>
      <g transform="rotate(180,60,60)">
        <ellipse className="op d3" cx="60" cy="40" rx="7" ry="20" fill="url(#flower-og)" />
      </g>
      <g transform="rotate(240,60,60)">
        <ellipse className="op d4" cx="60" cy="40" rx="7" ry="20" fill="url(#flower-og)" />
      </g>
      <g transform="rotate(300,60,60)">
        <ellipse className="op d5" cx="60" cy="40" rx="7" ry="20" fill="url(#flower-og)" />
      </g>

      <g transform="rotate(30,60,60)">
        <ellipse className="ip i0" cx="60" cy="46" rx="5" ry="14" fill="url(#flower-ig)" />
      </g>
      <g transform="rotate(90,60,60)">
        <ellipse className="ip i1" cx="60" cy="46" rx="5" ry="14" fill="url(#flower-ig)" />
      </g>
      <g transform="rotate(150,60,60)">
        <ellipse className="ip i2" cx="60" cy="46" rx="5" ry="14" fill="url(#flower-ig)" />
      </g>
      <g transform="rotate(210,60,60)">
        <ellipse className="ip i3" cx="60" cy="46" rx="5" ry="14" fill="url(#flower-ig)" />
      </g>
      <g transform="rotate(270,60,60)">
        <ellipse className="ip i4" cx="60" cy="46" rx="5" ry="14" fill="url(#flower-ig)" />
      </g>
      <g transform="rotate(330,60,60)">
        <ellipse className="ip i5" cx="60" cy="46" rx="5" ry="14" fill="url(#flower-ig)" />
      </g>

      <g transform="rotate(0,60,60)">
        <circle className="st s0" cx="60" cy="50" r="2.5" fill="#FFD700" />
      </g>
      <g transform="rotate(72,60,60)">
        <circle className="st s1" cx="60" cy="50" r="2.5" fill="#FFD700" />
      </g>
      <g transform="rotate(144,60,60)">
        <circle className="st s2" cx="60" cy="50" r="2.5" fill="#FFD700" />
      </g>
      <g transform="rotate(216,60,60)">
        <circle className="st s3" cx="60" cy="50" r="2.5" fill="#FFD700" />
      </g>
      <g transform="rotate(288,60,60)">
        <circle className="st s4" cx="60" cy="50" r="2.5" fill="#FFD700" />
      </g>

      <circle className="pi p0" cx="60" cy="60" r="5" fill="#EE740C" />
    </svg>
  );
}
