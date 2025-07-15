import React, { useState } from 'react';
import { Button, Form, Input, message, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { callForgotPassword } from '@/config/api';
import styles from 'styles/auth.module.scss';

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
        <div className={styles["forgot-password-page"]}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <div className={styles["brand-logo"]}></div>

                        {!emailSent ? (
                            <>
                                <div className={styles.heading}>
                                    <h2 className={`${styles.text} ${styles["text-large"]}`}>Quên Mật Khẩu</h2>
                                    <p className={`${styles.text} ${styles["text-normal"]}`}>
                                        Nhập email của bạn để nhận liên kết khôi phục mật khẩu
                                    </p>
                                </div>

                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={onFinish}
                                >
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không hợp lệ!' }
                                        ]}
                                    >
                                        <Input
                                            placeholder="Nhập email của bạn"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item style={{ marginTop: '2rem' }}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            size="large"
                                            block
                                        >
                                            Gửi Email Khôi Phục
                                        </Button>
                                    </Form.Item>
                                </Form>

                                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    <p className={`${styles.text} ${styles["text-normal"]}`}>
                                        Nhớ lại mật khẩu?
                                        <Link to="/login" className={styles["text-links"]}>Đăng nhập ngay</Link>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.heading}>
                                    <h2 className={`${styles.text} ${styles["text-large"]}`}>Email Đã Được Gửi!</h2>
                                    <p className={`${styles.text} ${styles["text-normal"]}`}>
                                        Chúng tôi đã gửi liên kết khôi phục mật khẩu đến:
                                    </p>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#8b5cf6',
                                        fontWeight: '600',
                                        margin: '1rem 0'
                                    }}>
                                        {sentEmail}
                                    </p>
                                    <p className={`${styles.text} ${styles["text-normal"]}`}>
                                        Vui lòng kiểm tra hộp thư (bao gồm thư mục spam).
                                    </p>
                                </div>

                                <div style={{ marginTop: '2rem' }}>
                                    <Button
                                        type="primary"
                                        onClick={handleResendEmail}
                                        loading={loading}
                                        size="large"
                                        block
                                        style={{ marginBottom: '1rem' }}
                                    >
                                        Gửi Lại Email
                                    </Button>

                                    <div style={{ textAlign: 'center' }}>
                                        <p className={`${styles.text} ${styles["text-normal"]}`}>
                                            <Link to="/login" className={styles["text-links"]}>Quay lại đăng nhập</Link>
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;
