import { useState } from 'react'
import { ChevronsLeftRight } from 'lucide-react'
import { images } from '../config/images'
import { Photo } from './Photo'

export function Comparison() {
  const [position, setPosition] = useState(50)
  return <figure className="comparison">
    <div className="compare-frame">
      <Photo photo={images.after} />
      <div className="compare-cover" style={{ clipPath: 'inset(0 ' + (100 - position) + '% 0 0)' }}>
        <Photo photo={images.before} />
      </div>
      <span className="compare-label before-label">Before</span>
      <span className="compare-label after-label">After</span>
      <span className="compare-divider" aria-hidden="true" style={{ left: position + '%' }}><ChevronsLeftRight size={20} /></span>
      <input type="range" min="0" max="100" value={position} onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Percentage of the before image shown" />
    </div>
    <figcaption>Illustrative comparison of stained and cleaned pavers. Drag or use the arrow keys to compare.</figcaption>
  </figure>
}
