import React, { useState } from 'react';
import Link from 'next/link';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import {
  CartPopupBody,
  PopupHeader,
  PopupItemCount,
  CloseButton,
  PromoCode,
  CheckoutButtonWrapper,
  CheckoutButton,
  Title,
  PriceBox,
  NoProductMsg,
  ItemWrapper,
  CouponBoxWrapper,
  CouponCode,
  ErrorMsg,
} from './cart.style';
import { CloseIcon } from 'assets/icons/CloseIcon';
import { ShoppingBagLarge } from 'assets/icons/ShoppingBagLarge';
import { CURRENCY } from 'utils/constant';
import { FormattedMessage } from 'react-intl';
import { useLocale } from 'contexts/language/language.provider';
import CouponBox from 'components/coupon-box/coupon-box';

import { Scrollbars } from 'react-custom-scrollbars';
import { useCart } from 'contexts/cart/use-cart';
import { CartItem } from 'components/cart-item/cart-item/cart-item';

type CartPropsType = {
  style?: any;
  className?: string;
  scrollbarHeight?: string;
  onCloseBtnClick?: (e: any) => void;
};

const APPLY_COUPON = gql`
  mutation applyCoupon($code: String!) {
    applyCoupon(code: $code) {
      id
      code
      discountInPercent
    }
  }
`;

const Cart: React.FC<CartPropsType> = ({
  style,
  className,
  onCloseBtnClick,
  scrollbarHeight,
  useReactionCart
}) => {
  let {
    items,
    coupon,
    addItem,
    removeItem,
    removeItemFromCart,
    cartItemsCount,
    calculatePrice,
    applyCoupon,
  } = useCart();


  items = useReactionCart.cart.items
  cartItemsCount = useReactionCart.cart.totalItemQuantity
  calculatePrice = () => useReactionCart.cart.checkout ? useReactionCart.cart.checkout.summary.total.amount : 0


  const [couponText, setCoupon] = useState('');
  const [displayCoupon, showCoupon] = useState(false);
  const [error, setError] = useState('');
  const [appliedCoupon] = useMutation(APPLY_COUPON);
  const { isRtl } = useLocale();

  const handleApplyCoupon = async () => {
    const { data }: any = await appliedCoupon({
      variables: { code: couponText },
    });
    if (data.applyCoupon && data.applyCoupon.discountInPercent) {
      setError('');
      applyCoupon(data.applyCoupon);
      setCoupon('');
    } else {
      setError('Invalid Coupon');
    }
  };

  const handleChange = (value: string) => {
    setCoupon(value);
  };

  const toggleCoupon = () => {
    showCoupon(true);
  };

  return (
    <CartPopupBody className={className} style={style}>
      <PopupHeader>
        <PopupItemCount>
          <ShoppingBagLarge width='19px' height='24px' />
          <span>
            {cartItemsCount}
            &nbsp;
            {cartItemsCount > 1 ? (
              <FormattedMessage id='cartItems' defaultMessage='items' />
            ) : (
              <FormattedMessage id='cartItem' defaultMessage='item' />
            )}
          </span>
        </PopupItemCount>

        <CloseButton onClick={onCloseBtnClick}>
          <CloseIcon />
        </CloseButton>
      </PopupHeader>

      <Scrollbars
        universal
        autoHide
        autoHeight
        autoHeightMax={scrollbarHeight}
        renderView={(props) => (
          <div
            {...props}
            style={{
              ...props.style,
              marginLeft: isRtl ? props.style.marginRight : 0,
              marginRight: isRtl ? 0 : props.style.marginRight,
            }}
          />
        )}
      >
        <ItemWrapper className='items-wrapper'>
          {!!cartItemsCount ? (
            items.map((item) => (
              <CartItem
                key={`cartItem-${item.id}`}
                onIncrement={() => addItem(item)}
                onDecrement={() => removeItem(item)}
                onRemove={() => removeItemFromCart(item)}
                data={item}
              />
            ))
          ) : (
            <NoProductMsg>
              <FormattedMessage
                id='noProductFound'
                defaultMessage='No products found'
              />
            </NoProductMsg>
          )}
        </ItemWrapper>
      </Scrollbars>

      <CheckoutButtonWrapper>
        <PromoCode>
          {!coupon?.discountInPercent ? (
            <>
              {!displayCoupon ? (
                <button onClick={toggleCoupon}>
                  <FormattedMessage
                    id='specialCode'
                    defaultMessage='Have a special code?'
                  />
                </button>
              ) : (
                <CouponBoxWrapper>
                  <CouponBox
                    onUpdate={handleChange}
                    value={couponText}
                    onClick={handleApplyCoupon}
                    disabled={!couponText.length || !items.length}
                    buttonTitle='Apply'
                    intlCouponApplyButton='voucherApply'
                    intlCouponBoxPlaceholder='couponPlaceholder'
                    style={{
                      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                  {error ? <ErrorMsg>{error}</ErrorMsg> : ''}
                </CouponBoxWrapper>
              )}
            </>
          ) : (
            <CouponCode>
              <FormattedMessage
                id='couponApplied'
                defaultMessage='Coupon Applied'
              />
              <span>{coupon.code}</span>
            </CouponCode>
          )}
        </PromoCode>

        {cartItemsCount !== 0 ? (
          <Link href='/checkout'>
            <CheckoutButton onClick={onCloseBtnClick}>
              <>
                <Title>
                  <FormattedMessage
                    id='navlinkCheckout'
                    defaultMessage='Checkout'
                  />
                </Title>
                <PriceBox>
                  {CURRENCY}
                  {calculatePrice()}
                </PriceBox>
              </>
            </CheckoutButton>
          </Link>
        ) : (
          <CheckoutButton>
            <>
              <Title>
                <FormattedMessage
                  id='navlinkCheckout'
                  defaultMessage='Checkout'
                />
              </Title>
              <PriceBox>
                {CURRENCY}
                {calculatePrice()}
              </PriceBox>
            </>
          </CheckoutButton>
        )}
      </CheckoutButtonWrapper>
    </CartPopupBody>
  );
};

export default Cart;
