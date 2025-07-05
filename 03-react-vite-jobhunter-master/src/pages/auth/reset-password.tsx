import React, { useState, useEffect } from 'react';
import { Button, Form, Input, message, Card, Typography, Space } from 'antd';
import { LockOutlined, ArrowLeftOutlined, CheckCircleOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { callValidateResetToken, callResetPassword } from '@/config/api';

const { Title, Text } = Typography;

const ResetPassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            message.error('Token không hợp lệ');
            navigate('/login');
            return;
        }

        validateToken();
    }, [token, navigate]);

    const validateToken = async () => {
        if (!token) return;
        
        setValidatingToken(true);
        try {
            const res = await callValidateResetToken(token);
            if (res && res.data && res.data.email) {
                setTokenValid(true);
                setUserEmail(res.data.email);
            } else {
                message.error('Token không hợp lệ hoặc đã hết hạn');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn');
            setTimeout(() => navigate('/login'), 2000);
        } finally {
            setValidatingToken(false);
        }
    };

    const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
        if (!token) return;
        
        setLoading(true);
        try {
            const res = await callResetPassword(token, values.newPassword);
            
            if (res && res.data !== undefined) {
                setResetSuccess(true);
                message.success('Đặt lại mật khẩu thành công!');
                // Tự động chuyển về trang login sau 3 giây
                setTimeout(() => navigate('/login'), 3000);
            } else {
                message.error(res.message || 'Có lỗi xảy ra, vui lòng thử lại!');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    if (validatingToken) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <Card
                    style={{
                        width: '100%',
                        maxWidth: '450px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        padding: '40px'
                    }}
                    bordered={false}
                >
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        animation: 'spin 1s linear infinite'
                    }}>
                        <LockOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                    <Title level={3} style={{ color: '#667eea' }}>
                        Đang xác thực...
                    </Title>
                    <Text type="secondary">
                        Vui lòng chờ trong khi chúng tôi xác thực token của bạn
                    </Text>
                </Card>
                <style>
                    {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    `}
                </style>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <Card
                    style={{
                        width: '100%',
                        maxWidth: '450px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        padding: '40px'
                    }}
                    bordered={false}
                >
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <LockOutlined style={{ fontSize: '36px', color: 'white' }} />
                    </div>
                    <Title level={2} style={{ color: '#ef4444', marginBottom: '16px' }}>
                        Token Không Hợp Lệ ❌
                    </Title>
                    <Text style={{ fontSize: '16px', color: '#6b7280', display: 'block', marginBottom: '24px' }}>
                        Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                    </Text>
                    <Link to="/login">
                        <Button
                            type="primary"
                            icon={<ArrowLeftOutlined />}
                            style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderColor: 'transparent',
                                borderRadius: '12px',
                                height: '50px',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}
                        >
                            Quay lại đăng nhập
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            {/* Background decorations */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)
                `,
                animation: 'float 6s ease-in-out infinite'
            }}></div>

            <Card
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    zIndex: 1
                }}
                bordered={false}
            >
                {!resetSuccess ? (
                    // Form đặt lại mật khẩu
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                            }}>
                                <LockOutlined style={{ fontSize: '36px', color: 'white' }} />
                            </div>
                            <Title level={2} style={{ 
                                margin: 0, 
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Đặt Lại Mật Khẩu 🔑
                            </Title>
                            <Text type="secondary" style={{ fontSize: '16px', marginTop: '8px', display: 'block' }}>
                                Cho tài khoản: <strong style={{ color: '#667eea' }}>{userEmail}</strong>
                            </Text>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            size="large"
                        >
                            <Form.Item
                                name="newPassword"
                                label={
                                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                                        🔐 Mật khẩu mới
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#667eea' }} />}
                                    placeholder="Nhập mật khẩu mới"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    style={{
                                        height: '50px',
                                        borderRadius: '12px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '16px'
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label={
                                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                                        🔐 Xác nhận mật khẩu
                                    </span>
                                }
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#667eea' }} />}
                                    placeholder="Nhập lại mật khẩu mới"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    style={{
                                        height: '50px',
                                        borderRadius: '12px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '16px'
                                    }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: '16px' }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        borderColor: 'transparent',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                                    }}
                                >
                                    Cập Nhật Mật Khẩu
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ textAlign: 'center' }}>
                            <Link to="/login">
                                <Button
                                    type="text"
                                    icon={<ArrowLeftOutlined />}
                                    style={{
                                        color: '#667eea',
                                        fontWeight: '600',
                                        fontSize: '14px'
                                    }}
                                >
                                    Quay lại đăng nhập
                                </Button>
                            </Link>
                        </div>
                    </>
                ) : (
                    // Thông báo thành công
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                        }}>
                            <CheckCircleOutlined style={{ fontSize: '36px', color: 'white' }} />
                        </div>

                        <Title level={2} style={{ 
                            margin: '0 0 16px 0', 
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Mật Khẩu Đã Được Cập Nhật! ✅
                        </Title>

                        <Text style={{ fontSize: '16px', color: '#6b7280', display: 'block', marginBottom: '24px' }}>
                            Mật khẩu của bạn đã được đặt lại thành công. 
                            <br />Bạn sẽ được chuyển về trang đăng nhập sau vài giây.
                        </Text>

                        <Link to="/login">
                            <Button
                                type="primary"
                                style={{
                                    width: '100%',
                                    height: '50px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    borderColor: 'transparent',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            >
                                Đăng Nhập Ngay
                            </Button>
                        </Link>
                    </div>
                )}
            </Card>

            <style>
                {`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                `}
            </style>
        </div>
    );
};

export default ResetPassword;
