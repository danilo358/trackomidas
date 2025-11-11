export default function GoogleDriveImage({ id, title, className }: { id: string; title?: string, className?: string}) {
  const src = `https://drive.google.com/file/d/${id}/preview`
  return (
    <iframe
      className={className ?? ''}
      src={src}
      title={title ?? 'Imagem'}
      sandbox="allow-scripts allow-same-origin"
      allow="autoplay"
      style={{ pointerEvents: 'none' }}
    />
  )
}