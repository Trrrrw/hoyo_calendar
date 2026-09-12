import { Alert, Spin } from 'antd'
import { useSearchParams } from 'react-router'
import { GameSwitcher } from '../components/GameSwitcher'
import { SubscriptionBuilder } from '../components/SubscriptionBuilder'
import type { Game } from '../types/calendar'

interface SubscriptionPageProps {
  games: Game[]
  loading: boolean
  error: string | null
}

export function SubscriptionPage({
  games,
  loading,
  error,
}: SubscriptionPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedGameId = searchParams.get('game')
  const game = games.find((item) => item.id === requestedGameId) ?? games[0]

  const setGame = (gameId: string) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('game', gameId)
    setSearchParams(nextParams)
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto overscroll-contain">
      {loading && !game ? (
        <div className="grid min-h-full place-items-center">
          <Spin spinning description="正在读取游戏列表" />
        </div>
      ) : (
        <div className="mx-auto w-[min(1400px,calc(100%-48px))] py-6 pb-12 max-sm:w-[calc(100%-24px)]">
          {error && (
            <Alert
              type="error"
              showIcon
              title="无法连接后端服务"
              description={`${error}，请检查后端地址配置`}
              className="mb-4"
            />
          )}
          <GameSwitcher
            games={games}
            value={game?.id ?? ''}
            loading={loading}
            onChange={setGame}
          />
          <Spin spinning={loading} description="正在读取游戏列表">
            {game && <SubscriptionBuilder game={game} />}
          </Spin>
        </div>
      )}
    </div>
  )
}
