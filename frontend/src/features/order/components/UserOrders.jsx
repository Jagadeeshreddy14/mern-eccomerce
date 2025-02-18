import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderByUserIdAsync, resetOrderFetchStatus, selectOrderFetchStatus, selectOrders } from '../OrderSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { Button, IconButton, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom'; // Ensure this is imported
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice';
import Lottie from 'lottie-react';
import { loadingAnimation, noOrdersAnimation } from '../../../assets';
import { toast } from 'react-toastify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

export const UserOrders = () => {
    const dispatch = useDispatch();
    const loggedInUser = useSelector(selectLoggedInUser);
    const orders = useSelector(selectOrders);
    const cartItems = useSelector(selectCartItems);
    const orderFetchStatus = useSelector(selectOrderFetchStatus);

    const theme = useTheme();
    const is1200 = useMediaQuery(theme.breakpoints.down("1200"));
    const is768 = useMediaQuery(theme.breakpoints.down("768"));
    const is660 = useMediaQuery(theme.breakpoints.down(660));
    const is480 = useMediaQuery(theme.breakpoints.down("480"));

    const cartItemAddStatus = useSelector(selectCartItemAddStatus);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }, []);

    useEffect(() => {
        dispatch(getOrderByUserIdAsync(loggedInUser?._id));
    }, [dispatch]);

    useEffect(() => {
        if (cartItemAddStatus === 'fulfilled') {
            toast.success("Product added to cart");
        } else if (cartItemAddStatus === 'rejected') {
            toast.error('Error adding product to cart, please try again later');
        }
    }, [cartItemAddStatus]);

    useEffect(() => {
        if (orderFetchStatus === 'rejected') {
            toast.error("Error fetching orders, please try again later");
        }
    }, [orderFetchStatus]);

    useEffect(() => {
        return () => {
            dispatch(resetOrderFetchStatus());
            dispatch(resetCartItemAddStatus());
        };
    }, []);

    const handleAddToCart = (product) => {
        const item = { user: loggedInUser._id, product: product._id, quantity: 1 };
        dispatch(addToCartAsync(item));
    };

    const handleTrackOrder = (orderId) => {
        // Fetch the order status from the backend or your store
        const orderStatus = orders.find(order => order._id === orderId)?.status;

        if (orderStatus) {
            // Assuming the status is available in the order object
            // Displaying the status, you can replace this logic with any desired action.
            toast.info(`Tracking Order Status: ${orderStatus}`);
        } else {
            toast.error('Order not found');
        }
    };

    return (
        <Stack justifyContent={'center'} alignItems={'center'}>
            {orderFetchStatus === 'pending' ?
                <Stack width={is480 ? 'auto' : '25rem'} height={'calc(100vh - 4rem)'} justifyContent={'center'} alignItems={'center'}>
                    <Lottie animationData={loadingAnimation} />
                </Stack>
                :
                <Stack width={is1200 ? "auto" : "60rem"} p={is480 ? 2 : 4} mb={'5rem'}>
                    <Stack flexDirection={'row'} columnGap={2}>
                        {!is480 && <motion.div whileHover={{ x: -5 }} style={{ alignSelf: "center" }}>
                            <IconButton component={Link} to={"/"}><ArrowBackIcon fontSize='large' /></IconButton>
                        </motion.div>}

                        <Stack rowGap={1}>
                            <Typography variant='h4' fontWeight={500}>Order history</Typography>
                            <Typography sx={{ wordWrap: "break-word" }} color={'text.secondary'}>
                                Check the status of recent orders, manage returns, and discover similar products.
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack mt={5} rowGap={5}>
                        {orders && orders.map((order) => (
                            <Stack p={is480 ? 0 : 2} component={is480 ? "" : Paper} elevation={1} rowGap={2} key={order._id}>
                                <Stack flexDirection={'row'} rowGap={'1rem'} justifyContent={'space-between'} flexWrap={'wrap'}>
                                    <Stack flexDirection={'row'} columnGap={4} rowGap={'1rem'} flexWrap={'wrap'}>
                                        <Stack>
                                            <Typography>Order Number</Typography>
                                            <Typography color={'text.secondary'}>{order._id}</Typography>
                                        </Stack>

                                        <Stack>
                                            <Typography>Date Placed</Typography>
                                            <Typography color={'text.secondary'}>{new Date(order.createdAt).toDateString()}</Typography>
                                        </Stack>

                                        <Stack>
                                            <Typography>Total Amount</Typography>
                                            <Typography>${order.total}</Typography>
                                        </Stack>
                                    </Stack>

                                    <Stack>
                                        <Typography>Item: {order.item.length}</Typography>
                                    </Stack>
                                </Stack>

                                <Stack mt={2} flexDirection={'row'} rowGap={is768 ? '2rem' : ''} columnGap={4} flexWrap={is768 ? "wrap" : "nowrap"} key={order._id}>
                                    <Stack>
                                        <img style={{ width: "100%", aspectRatio: is480 ? 3 / 2 : 1 / 1, objectFit: "contain" }} src={order.item[0].product.images[0]} alt="" />
                                    </Stack>

                                    <Stack rowGap={1} width={'100%'}>
                                        <Stack flexDirection={'row'} justifyContent={'space-between'}>
                                            <Stack>
                                                <Typography variant='h6' fontSize={'1rem'} fontWeight={500}>{order.item[0].product.title}</Typography>
                                                <Typography variant='body1' fontSize={'.9rem'} color={'text.secondary'}>{order.item[0].product.brand.name}</Typography>
                                                <Typography color={'text.secondary'} fontSize={'.9rem'}>Qty: {order.item[0].quantity}</Typography>
                                            </Stack>
                                            <Typography>${order.item[0].product.price}</Typography>
                                        </Stack>

                                        <Typography color={'text.secondary'}>{order.item[0].product.description}</Typography>

                                        <Stack mt={2} alignSelf={is480 ? "flex-start" : 'flex-end'} flexDirection={'row'} columnGap={2}>
                                            <Button size='small' component={Link} to={`/product-details/${order.item[0].product._id}`} variant='outlined'>View Product</Button>
                                            {cartItems.some((cartItem) => cartItem.product._id === order.item[0].product._id) ? 
                                                <Button size='small' variant='contained' component={Link} to={"/cart"}>Already in Cart</Button>
                                                : 
                                                <Button size='small' variant='contained' onClick={() => handleAddToCart(order.item[0].product)}>Buy Again</Button>
                                            }
                                        </Stack>
                                    </Stack>
                                </Stack>

                                <Stack mt={2} flexDirection={'row'} justifyContent={'space-between'}>
                                    <Stack flexDirection={'row'} alignItems="center">
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => handleTrackOrder(order._id)}
                                            size="small"
                                        >
                                            Track Order
                                        </Button>
                                        <Typography variant="body2" color="text.secondary" ml={2}>
                                            Status: {order.status || "Not Available"}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            }
        </Stack>
    );
};
