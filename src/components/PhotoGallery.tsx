import type { Photo as PhotoData } from '../config/images'
import { Photo } from './Photo'

export function PhotoGallery({ photos }: { photos: PhotoData[] }) {
  return <ul className="photo-gallery">
    {photos.map((photo) => <li key={photo.src}><figure><Photo photo={photo} sizes="(max-width: 620px) 100vw, 33vw" />
      {photo.caption && <figcaption>{photo.caption}</figcaption>}</figure></li>)}
  </ul>
}
