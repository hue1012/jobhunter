import { Button, Divider, Form, Input, Row, Select, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from 'config/api';
import styles from 'styles/auth.module.scss';
import { IUser } from '@/types/backend';
const { Option } = Select;


const RegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish = async (values: IUser) => {
        const { name, email, password, age, gender, address } = values;

        if (!name || !email || !password || !age || !gender || !address) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: "Vui lòng điền đầy đủ thông tin",
                duration: 5
            });
            return;
        }

        setIsSubmit(true);
        const res = await callRegister(name, email, password, +age, gender, address);
        setIsSubmit(false);
        if (res?.data?.id) {
            message.success('Đăng ký tài khoản thành công!');
            navigate('/login')
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description:
                    res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 5
            })
        }
    };


    return (
        <div className={styles["register-page"]}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <div className={styles["brand-logo"]}></div>
                        <div className={styles.heading}>
                            <h2 className={`${styles.text} ${styles["text-large"]}`}>Đăng Ký Tài Khoản</h2>
                            <p className={`${styles.text} ${styles["text-normal"]}`}>Tạo tài khoản mới để bắt đầu hành trình tìm việc của bạn</p>
                        </div>
                        <Form<IUser>
                            name="register"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout="vertical"
                        >
                            <Form.Item
                                label="Họ và tên"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                            >
                                <Input
                                    placeholder="Nhập họ và tên của bạn"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    type='email'
                                    placeholder="Nhập địa chỉ email của bạn"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password
                                    placeholder="Nhập mật khẩu của bạn"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Tuổi"
                                name="age"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tuổi!' },
                                    { type: 'number', min: 16, max: 100, message: 'Tuổi phải từ 16 đến 100!' }
                                ]}
                            >
                                <Input
                                    type='number'
                                    placeholder="Nhập tuổi của bạn"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Giới tính"
                                name="gender"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                            >
                                <Select
                                    placeholder="Chọn giới tính"
                                    size="large"
                                    allowClear
                                >
                                    <Option value="MALE">Nam</Option>
                                    <Option value="FEMALE">Nữ</Option>
                                    <Option value="OTHER">Khác</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Địa chỉ"
                                name="address"
                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                            >
                                <Input
                                    placeholder="Nhập địa chỉ của bạn"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item style={{ marginTop: '2rem' }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmit}
                                    size="large"
                                    block
                                >
                                    Đăng ký tài khoản
                                </Button>
                            </Form.Item>

                            <Divider>Hoặc</Divider>

                            <p className={`${styles.text} ${styles["text-normal"]}`}>
                                Đã có tài khoản?
                                <Link to='/login' className={styles["text-links"]}>Đăng nhập ngay</Link>
                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default RegisterPage;