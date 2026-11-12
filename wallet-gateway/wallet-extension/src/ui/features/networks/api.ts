import { queryOptions } from '@tanstack/react-query'
import { queryKeys } from '@/ui/lib/query/keys'
import { getUserClient } from '@/ui/lib/user-client'

export const networksQuery = () =>
    queryOptions({
        queryKey: queryKeys.networks.list(),
        queryFn: () => getUserClient().request({ method: 'listNetworks' }),
        staleTime: 0,
    })
