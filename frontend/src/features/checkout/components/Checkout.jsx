import { Stack, TextField, Typography, Button, Grid, FormControl, Radio, Paper, IconButton, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import React, { useEffect, useState } from 'react';
import { Cart } from '../../cart/components/Cart';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { addAddressAsync, selectAddressStatus, selectAddresses } from '../../address/AddressSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { Link, useNavigate } from 'react-router-dom';
import { createOrderAsync, selectCurrentOrder, selectOrderStatus } from '../../order/OrderSlice';
import { resetCartByUserIdAsync, selectCartItems } from '../../cart/CartSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SHIPPING, TAXES } from '../../../constants';
import { motion } from 'framer-motion';

// Styled Components
const StyledPaper = ({ children }) => (
  <Paper
    sx={{
      p: 2,
      width: { xs: '100%', md: '20rem' },
      height: { xs: 'auto', md: '15rem' },
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    }}
  >
    {children}
  </Paper>
);

export const Checkout = () => {
  const status = '';
  const addresses = useSelector(selectAddresses);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const loggedInUser = useSelector(selectLoggedInUser);
  const addressStatus = useSelector(selectAddressStatus);
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const orderStatus = useSelector(selectOrderStatus);
  const currentOrder = useSelector(selectCurrentOrder);
  const orderTotal = cartItems.reduce((acc, item) => (item.product.price * item.quantity) + acc, 0);

  useEffect(() => {
    if (addressStatus === 'fulfilled') {
      reset();
    } else if (addressStatus === 'rejected') {
      alert('Error adding your address');
    }
  }, [addressStatus]);

  useEffect(() => {
    if (currentOrder && currentOrder?._id) {
      dispatch(resetCartByUserIdAsync(loggedInUser?._id));
      navigate(`/order-success/${currentOrder?._id}`);
    }
  }, [currentOrder]);

  const handleAddAddress = (data) => {
    const address = { ...data, user: loggedInUser._id };
    dispatch(addAddressAsync(address));
  };

  const handleCreateOrder = () => {
    const order = {
      user: loggedInUser._id,
      item: cartItems,
      address: selectedAddress,
      paymentMode: selectedPaymentMethod,
      total: orderTotal + SHIPPING + TAXES,
    };
    dispatch(createOrderAsync(order));
  };

  return (
    <Stack
      flexDirection={'row'}
      p={2}
      rowGap={10}
      justifyContent={'center'}
      flexWrap={'wrap'}
      mb={'5rem'}
      mt={2}
      columnGap={4}
      alignItems={'flex-start'}
      sx={{
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        padding: { xs: '1rem', md: '2rem' },
      }}
    >
      {/* Left Box */}
      <Stack rowGap={4} sx={{ maxWidth: '50rem', width: '100%' }}>
        {/* Heading */}
        <Stack flexDirection={'row'} columnGap={1} alignItems={'center'}>
          <motion.div whileHover={{ x: -5 }}>
            <IconButton component={Link} to="/cart">
              <ArrowBackIcon fontSize="large" />
            </IconButton>
          </motion.div>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Shipping Information
          </Typography>
        </Stack>

        {/* Address Form */}
        <Stack
          component={'form'}
          noValidate
          rowGap={2}
          onSubmit={handleSubmit(handleAddAddress)}
          sx={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Stack>
            <Typography gutterBottom sx={{ fontWeight: 'medium', color: '#555' }}>
              Type
            </Typography>
            <TextField
              placeholder="Eg. Home, Business"
              {...register('type', { required: true })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  borderColor: '#ccc',
                },
              }}
            />
          </Stack>

          <Stack>
            <Typography gutterBottom sx={{ fontWeight: 'medium', color: '#555' }}>
              Street
            </Typography>
            <TextField
              {...register('street', { required: true })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  borderColor: '#ccc',
                },
              }}
            />
          </Stack>

          <Stack>
            <Typography gutterBottom sx={{ fontWeight: 'medium', color: '#555' }}>
              Country
            </Typography>
            <TextField
              {...register('country', { required: true })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  borderColor: '#ccc',
                },
              }}
            />
          </Stack>

          <Stack flexDirection={'row'} gap={2}>
            <Stack width={'100%'}>
              <Typography gutterBottom sx={{ fontWeight: 'medium', color: '#555' }}>
                City
              </Typography>
              <TextField
                {...register('city', { required: true })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    borderColor: '#ccc',
                  },
                }}
              />
            </Stack>
            <Stack width={'100%'}>
              <Typography gutterBottom sx={{ fontWeight: 'medium', color: '#555' }}>
                State
              </Typography>
              <TextField
                {...register('state', { required: true })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    borderColor: '#ccc',
                  },
                }}
              />
            </Stack>
            <Stack width={'100%'}>
              <Typography gutterBottom sx={{ fontWeight: 'medium', color: '#555' }}>
                Postal Code
              </Typography>
              <TextField
                type="number"
                {...register('postalCode', { required: true })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    borderColor: '#ccc',
                  },
                }}
              />
            </Stack>
          </Stack>

          <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={1}>
            <LoadingButton
              loading={status === 'pending'}
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#43a047' },
              }}
            >
              Add
            </LoadingButton>
            <Button
              color="error"
              variant="outlined"
              onClick={() => reset()}
              sx={{
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': { borderColor: '#d32f2f', color: '#d32f2f' },
              }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>

        {/* Existing Addresses */}
        <Stack rowGap={3}>
          <Stack>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Address
            </Typography>
            <Typography variant="body2" color={'text.secondary'}>
              Choose from existing addresses
            </Typography>
          </Stack>
          <Grid container gap={2} justifyContent={'flex-start'}>
            {addresses.map((address, index) => (
              <FormControl key={address._id}>
                <StyledPaper>
                  <Stack flexDirection={'row'} alignItems={'center'}>
                    <Radio
                      checked={selectedAddress === address}
                      name="addressRadioGroup"
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(addresses[index])}
                    />
                    <Typography sx={{ fontWeight: 'medium', color: '#555' }}>{address.type}</Typography>
                  </Stack>
                  <Stack>
                    <Typography>{address.street}</Typography>
                    <Typography>{`${address.state}, ${address.city}, ${address.country}, ${address.postalCode}`}</Typography>
                    <Typography>{address.phoneNumber}</Typography>
                  </Stack>
                </StyledPaper>
              </FormControl>
            ))}
          </Grid>
        </Stack>

        {/* Payment Methods */}
        <Stack rowGap={3}>
          <Stack>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Payment Methods
            </Typography>
            <Typography variant="body2" color={'text.secondary'}>
              Please select a payment method
            </Typography>
          </Stack>
          <Stack rowGap={2}>
            <Stack flexDirection={'row'} alignItems={'center'}>
              <Radio
                value={selectedPaymentMethod}
                name="paymentMethod"
                checked={selectedPaymentMethod === 'COD'}
                onChange={() => setSelectedPaymentMethod('COD')}
              />
              <Typography sx={{ fontWeight: 'medium', color: '#555' }}>Cash</Typography>
            </Stack>
            <Stack flexDirection={'row'} alignItems={'center'}>
              <Radio
                value={selectedPaymentMethod}
                name="paymentMethod"
                checked={selectedPaymentMethod === 'CARD'}
                onChange={() => setSelectedPaymentMethod('CARD')}
              />
              <Typography sx={{ fontWeight: 'medium', color: '#555' }}>Card</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* Right Box */}
      <Stack
        width={{ xs: '100%', md: 'auto' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        sx={{
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
          Order Summary
        </Typography>
        <Cart checkout={true} />
        <LoadingButton
          fullWidth
          loading={orderStatus === 'pending'}
          variant="contained"
          onClick={handleCreateOrder}
          size="large"
          sx={{
            marginTop: '1rem',
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          Pay and Order
        </LoadingButton>
      </Stack>
    </Stack>
  );
};