import { bbbSeal } from '../../shared/bbb-seal.mjs'

export function BbbSeal({ hero = false }: { hero?: boolean }) {
  return <a className={hero ? 'bbb-seal hero-seal' : 'bbb-seal'} href={bbbSeal.profileUrl} target="_blank" rel="nofollow noopener">
    <img src={bbbSeal.imageUrl} width={160} height={82} loading={hero ? 'eager' : 'lazy'}
      alt="IXP Home Services BBB Business Review" />
  </a>
}
