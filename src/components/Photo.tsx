import type { Photo as PhotoData } from '../config/images'

export function Photo({ photo, eager = false, className, sizes = '(max-width: 700px) 100vw, 50vw' }: {
  photo: PhotoData
  eager?: boolean
  className?: string
  sizes?: string
}) {
  return <img className={className} src={photo.src}
    srcSet={photo.small ? photo.small + ' 640w, ' + photo.src + ' 1280w' : undefined}
    sizes={photo.small ? sizes : undefined}
    alt={photo.alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" />
}
