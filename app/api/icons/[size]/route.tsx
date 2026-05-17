import { ImageResponse } from 'next/og'

export async function GET(
  _request: Request,
  { params }: { params: { size: string } },
) {
  const size = parseInt(params.size)
  if (size !== 192 && size !== 512) {
    return new Response('Not Found', { status: 404 })
  }

  const radius = Math.round(size * 0.22)
  const fontSize = Math.round(size * 0.58)

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: `${radius}px`,
        fontSize,
      }}
    >
      🛒
    </div>,
    { width: size, height: size },
  )
}
