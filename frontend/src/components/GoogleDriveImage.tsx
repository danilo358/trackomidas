export default function GoogleDriveImage({ id, title }: { id: string; title?: string }) {
  const src = `https://drive.google.com/file/d/${id}/preview`
  return (
    <iframe
      className="w-full aspect-square rounded-xl border border-white/10"
      src={src}
      title={title ?? 'Imagem'}
      sandbox="allow-scripts allow-same-origin"
      allow="autoplay"
    />
  )
}