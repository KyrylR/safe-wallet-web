import { ReactElement, useMemo } from 'react'
import Typography from '@mui/material/Typography'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'

import { shortenAddress } from '@/utils/formatters'
import { formatCurrency } from '@/utils/formatNumber'
import useSafeInfo from '@/hooks/useSafeInfo'
import SafeIcon from '@/components/common/SafeIcon'
import NewTxButton from '@/components/sidebar/NewTxButton'
import useBalances from '@/hooks/useBalances'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/sessionSlice'

import css from './styles.module.css'
import { selectSettings } from '@/store/settingsSlice'
import { useCurrentChain } from '@/hooks/useChains'
import { getExplorerLink } from '@/utils/gateway'

const HeaderIconButton = ({ children, ...props }: Omit<IconButtonProps, 'className' | 'disableRipple' | 'sx'>) => (
  <IconButton
    className={css.iconButton}
    sx={({ palette }) => ({
      backgroundColor: palette.border.background,
      '&:hover': {
        backgroundColor: palette.primary.background,
      },
    })}
    {...props}
  >
    {children}
  </IconButton>
)

const SafeHeader = (): ReactElement => {
  const currency = useAppSelector(selectCurrency)
  const { balances } = useBalances()
  const { safe, loading } = useSafeInfo()
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)

  const address = safe?.address.value || ''

  const { threshold, owners } = safe || {}

  // TODO: Format to parts w/ style
  const fiat = useMemo(() => {
    return formatCurrency(balances.fiatTotal, currency)
  }, [currency, balances.fiatTotal])

  const handleCopy = () => {
    const text = settings.shortName.copy && chain ? `${chain.shortName}:${address}` : address
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={css.container}>
      <div className={css.safe}>
        <div className={css.icon}>
          {loading ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : (
            <SafeIcon address={address} threshold={threshold} owners={owners?.length} />
          )}
        </div>
        <div>
          <Typography variant="body2">
            {loading ? <Skeleton variant="text" width={86} /> : address ? shortenAddress(address) : '...'}
          </Typography>
          <Typography variant="body1">{loading ? <Skeleton variant="text" width={60} /> : fiat}</Typography>
        </div>
      </div>
      <div className={css.iconButtons}>
        {/* 
        TODO: Add QR functionality */}
        <HeaderIconButton disabled>
          <img src="/images/sidebar/qr.svg" alt="Address QR Code" height="16px" width="16px" />
        </HeaderIconButton>
        <HeaderIconButton onClick={handleCopy}>
          <img src="/images/sidebar/copy.svg" alt="Copy Address" height="16px" width="16px" />
        </HeaderIconButton>
        <a target="_blank" rel="noreferrer" {...(chain && getExplorerLink(address, chain.blockExplorerUriTemplate))}>
          <HeaderIconButton>
            <img src="/images/sidebar/block-explorer.svg" alt="Open Block Explorer" height="16px" width="16px" />
          </HeaderIconButton>
        </a>
      </div>
      <NewTxButton />
    </div>
  )
}

export default SafeHeader