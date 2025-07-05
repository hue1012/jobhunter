import React, { useState } from 'react';
import { Button, Form, Input, message, Card, Typography, Space } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { callForgotPassword } from '@/config/api';

const { Title, Text } = Typography;

const ForgotPassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');

    const onFinish = async (values: { email: string }) => {
        setLoading(true);
        try {
            const res = await callForgotPassword(values.email);
            
            if (res && res.data) {
                setEmailSent(true);
                setSentEmail(values.email);
                message.success('Email khôi phục mật khẩu đã được gửi!');
            } else {
                message.error(res.message || 'Có lỗi xảy ra, vui lòng thử lại!');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!sentEmail) return;
        
        setLoading(true);
        try {
            const res = await callForgotPassword(sentEmail);
            if (res && res.data) {
                message.success('Email đã được gửi lại!');
            } else {
                message.error('Có lỗi xảy ra, vui lòng thử lại!');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

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
                {!emailSent ? (
                    // Form quên mật khẩu
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
                                <MailOutlined style={{ fontSize: '36px', color: 'white' }} />
                            </div>
                            <Title level={2} style={{ 
                                margin: 0, 
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Quên Mật Khẩu? 🔐
                            </Title>
                            <Text type="secondary" style={{ fontSize: '16px', marginTop: '8px', display: 'block' }}>
                                Nhập email của bạn để nhận liên kết khôi phục mật khẩu
                            </Text>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            size="large"
                        >
                            <Form.Item
                                name="email"
                                label={
                                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                                        📧 Địa chỉ Email
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined style={{ color: '#667eea' }} />}
                                    placeholder="Nhập email của bạn"
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
                                    Gửi Email Khôi Phục
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
                    // Thông báo đã gửi email
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
                            Email Đã Được Gửi! ✅
                        </Title>

                        <Text style={{ fontSize: '16px', color: '#6b7280', display: 'block', marginBottom: '8px' }}>
                            Chúng tôi đã gửi liên kết khôi phục mật khẩu đến:
                        </Text>
                        <Text strong style={{ fontSize: '16px', color: '#667eea', display: 'block', marginBottom: '24px' }}>
                            {sentEmail}
                        </Text>
                        <Text style={{ fontSize: '14px', color: '#6b7280', display: 'block', marginBottom: '24px' }}>
                            Vui lòng kiểm tra hộp thư (bao gồm thư mục spam).
                        </Text>

                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Button
                                type="primary"
                                onClick={handleResendEmail}
                                loading={loading}
                                style={{
                                    width: '100%',
                                    height: '50px',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    borderColor: 'transparent',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            >
                                Gửi Lại Email
                            </Button>

                            <Link to="/login" style={{ display: 'block' }}>
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
                        </Space>
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

export default ForgotPassword;
