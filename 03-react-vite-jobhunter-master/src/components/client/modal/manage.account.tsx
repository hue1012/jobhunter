import { Button, Col, Form, Input, Modal, Row, Select, Table, Tabs, message, notification, Card, Space, Typography, Divider, Avatar } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IResume, ISubscribers } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callCreateSubscriber, callFetchAllSkill, callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber, callFetchUserById } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
    MonitorOutlined,
    LockOutlined,
    FileTextOutlined,
    MailOutlined,
    UserOutlined,
    SafetyOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    LinkOutlined
} from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
import { callUpdateUser, callChangePassword } from "@/config/api";
import type { IUser } from "@/types/backend";

const { Title, Text } = Typography;

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data.result as IResume[])
            }
            setIsFetching(false);
        }
        init();
    }, [])

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#faad14';
            case 'reviewing': return '#1890ff';
            case 'approved': return '#52c41a';
            case 'rejected': return '#ff4d4f';
            default: return '#d9d9d9';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <ClockCircleOutlined />;
            case 'reviewing': return <EyeOutlined />;
            case 'approved': return <CheckCircleOutlined />;
            case 'rejected': return <ClockCircleOutlined />;
            default: return <ClockCircleOutlined />;
        }
    };

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: "center",
            render: (text, record, index) => (
                <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '500'
                }}>
                    {index + 1}
                </div>
            )
        },
        {
            title: 'Công Ty',
            dataIndex: "companyName",
            render: (text) => (
                <Text strong style={{ color: '#f39c12' }}>{text}</Text>
            )
        },
        {
            title: 'Vị trí ứng tuyển',
            dataIndex: ["job", "name"],
            render: (text) => (
                <Text>{text}</Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
            align: 'center',
            render: (status) => (
                <Space>
                    <span style={{ color: getStatusColor(status) }}>
                        {getStatusIcon(status)}
                    </span>
                    <Text style={{ color: getStatusColor(status), fontWeight: '500' }}>
                        {status}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Ngày ứng tuyển',
            dataIndex: "createdAt",
            render: (value) => (
                <Text type="secondary">
                    {dayjs(value).format('DD/MM/YYYY HH:mm')}
                </Text>
            )
        },
        {
            title: 'Hành động',
            dataIndex: "",
            align: 'center',
            render: (value, record) => (
                <Button
                    type="link"
                    icon={<LinkOutlined />}
                    href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${record?.url}`}
                    target="_blank"
                    style={{ padding: 0 }}
                >
                    Xem CV
                </Button>
            )
        },
    ];

    return (
        <Card
            bordered={false}
            style={{
                background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                borderRadius: '12px',
                overflow: 'hidden'
            }}
        >
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                padding: '24px',
                backdropFilter: 'blur(10px)'
            }}>
                <Space align="center" style={{ marginBottom: '20px' }}>
                    <Avatar
                        size={40}
                        style={{ backgroundColor: '#f39c12' }}
                        icon={<FileTextOutlined />}
                    />
                    <div>
                        <Title level={4} style={{ margin: 0, color: '#f39c12' }}>
                            Lịch sử ứng tuyển
                        </Title>
                        <Text type="secondary">Theo dõi các CV đã gửi</Text>
                    </div>
                </Space>

                <Table<IResume>
                    columns={columns}
                    dataSource={listCV}
                    loading={isFetching}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng ${total} CV`
                    }}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                    locale={{
                        emptyText: "Chưa có CV nào được gửi"
                    }}
                />
            </div>
        </Card>
    );
}

const UserUpdateInfo = (props: any) => {
    const userBasic = useAppSelector(state => state.account.user) as IUser;
    const [form] = Form.useForm();
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchDetail = async () => {
            if (userBasic?.id) {
                setLoading(true);
                try {
                    const userId = typeof userBasic.id === 'string'
                        ? parseInt(userBasic.id)
                        : userBasic.id;

                    const res = await callFetchUserById(userId);

                    if (res && res.data) {
                        setUser(res.data);
                    } else {
                        setUser(userBasic);
                    }
                } catch (error) {
                    setUser(userBasic);
                    message.warning("Sử dụng thông tin từ phiên đăng nhập");
                } finally {
                    setLoading(false);
                }
            } else if (userBasic) {
                setUser(userBasic);
            } else {
                message.error("Không tìm thấy thông tin người dùng");
            }
        };

        fetchDetail();
    }, [userBasic?.id, userBasic]);

    // Fix: Đơn giản hóa việc set form values với fallback cho email
    useEffect(() => {
        if (user) {
            console.log("Setting form values for user:", user); // Debug log
            const formValues = {
                name: user.name || "",
                email: user.email || userBasic?.email || "", // Fallback từ userBasic nếu user.email bị mất
                address: user.address || "",
                age: typeof user.age === "number" ? user.age : undefined,
                gender: user.gender && ["MALE", "FEMALE", "OTHER"].includes(user.gender)
                    ? user.gender : undefined
            };
            console.log("Form values to set:", formValues); // Debug log
            form.setFieldsValue(formValues);
        }
    }, [user, form, userBasic?.email]);

    const onFinish = async (values: any) => {
        if (!user?.id) {
            message.error("Không tìm thấy ID người dùng");
            return;
        }

        try {
            const res = await callUpdateUser({
                ...user,
                ...values,
                email: user.email, // Đảm bảo email luôn được preserve
                age: values.age ? Number(values.age) : null,
            });

            console.log("API Response:", res); // Debug log để kiểm tra response

            if (res && res.data) {
                message.success("Cập nhật thông tin thành công");
                // Đảm bảo email được preserve trong response
                const updatedUser = {
                    ...res.data,
                    email: res.data.email || user.email // Fallback nếu API không trả về email
                };
                console.log("Updated user:", updatedUser); // Debug log
                setUser(updatedUser);
            } else {
                message.error("Cập nhật thất bại");
            }
        } catch (error) {
            console.error("Update error:", error);
            message.error("Có lỗi xảy ra khi cập nhật");
        }
    };

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '80px',
                background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                borderRadius: '12px',
                color: 'white'
            }}>
                <div className="loading-spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(255,255,255,0.3)',
                    borderTop: '4px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                }}></div>
                Đang tải thông tin...
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '80px',
                background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                borderRadius: '12px',
                color: '#d68910'
            }}>
                <UserOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <br />
                Không tìm thấy thông tin người dùng
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            padding: '20px'
        }}>
            <Card
                bordered={false}
                style={{
                    background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '700px'
                }}
            >
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    padding: '32px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Space align="center" style={{ marginBottom: '24px', width: '100%', justifyContent: 'center' }}>
                        <Avatar
                            size={48}
                            style={{ backgroundColor: '#f39c12' }}
                            icon={<UserOutlined />}
                        />
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#f39c12' }}>
                                Thông tin cá nhân
                            </Title>
                            <Text type="secondary">Cập nhật thông tin để hoàn thiện hồ sơ</Text>
                        </div>
                    </Space>

                    <Form
                        key={user?.id} // Force re-render khi user thay đổi
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{
                            name: user?.name || "",
                            email: user?.email || userBasic?.email || "", // Fallback từ userBasic
                            address: user?.address || "",
                            age: typeof user?.age === "number" ? user?.age : undefined,
                            gender: user?.gender && ["MALE", "FEMALE", "OTHER"].includes(user?.gender)
                                ? user?.gender : undefined
                        }}
                    >
                        <Row gutter={[24, 16]}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<Text strong>Họ và tên</Text>}
                                    name="name"
                                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                                >
                                    <Input
                                        prefix={<UserOutlined style={{ color: '#f39c12' }} />}
                                        size="large"
                                        placeholder="Nhập họ và tên"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<Text strong>Email</Text>}
                                    name="email"
                                >
                                    <Input
                                        prefix={<MailOutlined style={{ color: '#f39c12' }} />}
                                        disabled
                                        size="large"
                                        style={{ borderRadius: '8px', backgroundColor: '#f8f9fa' }}
                                        value={user?.email || userBasic?.email || ""} // Controlled value với fallback
                                        placeholder={user?.email || userBasic?.email || "Email không có sẵn"}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item label={<Text strong>Địa chỉ</Text>} name="address">
                                    <Input
                                        size="large"
                                        placeholder="Nhập địa chỉ của bạn"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={<Text strong>Tuổi</Text>} name="age">
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        size="large"
                                        placeholder="Nhập tuổi"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label={<Text strong>Giới tính</Text>} name="gender">
                                    <Select
                                        allowClear
                                        size="large"
                                        placeholder="Chọn giới tính"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <Select.Option value="MALE">Nam</Select.Option>
                                        <Select.Option value="FEMALE">Nữ</Select.Option>
                                        <Select.Option value="OTHER">Khác</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                style={{
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                                    border: 'none',
                                    height: '48px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 15px rgba(253, 203, 110, 0.3)',
                                    color: '#d68910'
                                }}
                                block
                            >
                                <UserOutlined /> Cập nhật thông tin
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

const UserChangePassword = (props: any) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);

    const onFinish = async (values: any) => {
        const { currentPassword, newPassword, confirmPassword } = values;

        if (newPassword !== confirmPassword) {
            message.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
            return;
        }

        setLoading(true);
        try {
            const res = await callChangePassword({
                currentPassword,
                newPassword
            });

            // Extract error message from response
            let errorMessage = '';

            // Check direct response fields first
            if (res?.error) {
                errorMessage = res.error;
            } else if (res?.message) {
                errorMessage = res.message;
            } else if (res?.data) {
                if (typeof res.data === 'string') {
                    errorMessage = res.data;
                } else if (res.data.message) {
                    errorMessage = res.data.message;
                } else if (res.data.error) {
                    errorMessage = res.data.error;
                }
            }

            // Check if this is an error response
            if (errorMessage) {
                const lowerMsg = errorMessage.toLowerCase();

                const isPasswordError = lowerMsg.includes('id khong ton tai') ||
                    lowerMsg.includes('id không tồn tại') ||
                    lowerMsg.includes('mật khẩu hiện tại') ||
                    lowerMsg.includes('mat khau hien tai') ||
                    lowerMsg.includes('không đúng') ||
                    lowerMsg.includes('khong dung') ||
                    lowerMsg.includes('incorrect') ||
                    lowerMsg.includes('wrong');

                if (isPasswordError) {
                    message.error("Mật khẩu hiện tại không chính xác");
                    setTimeout(() => {
                        form.setFieldValue('currentPassword', '');
                        form.getFieldInstance('currentPassword')?.focus();
                    }, 100);
                    return;
                }
            }

            // Check for success patterns
            const isSuccess = (errorMessage && (errorMessage.includes('thành công') || errorMessage.toLowerCase().includes('success'))) ||
                res?.success === true ||
                res?.status === 200;

            if (isSuccess) {
                message.success("Đổi mật khẩu thành công");
                form.resetFields();
            } else if (errorMessage) {
                message.error(errorMessage);
            } else {
                message.success("Đổi mật khẩu thành công");
                form.resetFields();
            }

        } catch (error: any) {
            // Extract error message from catch block
            let errorMessage = '';

            if (error?.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            }

            if (!errorMessage && error?.message) {
                errorMessage = error.message;
            }

            if (errorMessage) {
                const lowerMsg = errorMessage.toLowerCase();

                const isWrongPassword = lowerMsg.includes('id khong ton tai') ||
                    lowerMsg.includes('id không tồn tại') ||
                    lowerMsg.includes('mat khau hien tai') ||
                    lowerMsg.includes('mật khẩu hiện tại') ||
                    lowerMsg.includes('current password') ||
                    (lowerMsg.includes('mật khẩu') && lowerMsg.includes('không đúng')) ||
                    (lowerMsg.includes('password') && lowerMsg.includes('incorrect')) ||
                    (lowerMsg.includes('password') && lowerMsg.includes('wrong'));

                if (isWrongPassword) {
                    message.error("Mật khẩu hiện tại không chính xác");
                    setTimeout(() => {
                        form.setFieldValue('currentPassword', '');
                        form.getFieldInstance('currentPassword')?.focus();
                    }, 100);

                } else if (lowerMsg.includes('unauthorized') || lowerMsg.includes('not logged in')) {
                    message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");

                } else if (lowerMsg.includes('user not found') || lowerMsg.includes('không tìm thấy')) {
                    message.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại");

                } else {
                    message.error(errorMessage);
                }
            } else {
                // Fallback error handling by status code
                const status = error?.response?.status;

                if (status === 400) {
                    message.error("Mật khẩu hiện tại không chính xác");
                    setTimeout(() => {
                        form.setFieldValue('currentPassword', '');
                        form.getFieldInstance('currentPassword')?.focus();
                    }, 100);
                } else if (status === 401) {
                    message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
                } else if (status === 422) {
                    message.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại");
                } else {
                    message.error("Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            padding: '20px'
        }}>
            <Card
                bordered={false}
                style={{
                    background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '600px'
                }}
            >
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    padding: '32px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Space align="center" style={{ marginBottom: '24px', width: '100%', justifyContent: 'center' }}>
                        <Avatar
                            size={48}
                            style={{ backgroundColor: '#f39c12' }}
                            icon={<SafetyOutlined />}
                        />
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ margin: 0, color: '#f39c12' }}>
                                Đổi mật khẩu
                            </Title>
                            <Text type="secondary">Bảo mật tài khoản với mật khẩu mạnh</Text>
                        </div>
                    </Space>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label={<Text strong>Mật khẩu hiện tại</Text>}
                            name="currentPassword"
                            rules={[
                                { required: true, message: "Vui lòng nhập mật khẩu hiện tại" }
                            ]}
                            extra={<Text type="secondary" style={{ fontSize: '12px' }}>
                                Nhập mật khẩu bạn đang sử dụng để đăng nhập
                            </Text>}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#f39c12' }} />}
                                placeholder="Nhập mật khẩu hiện tại"
                                size="large"
                                style={{ borderRadius: '8px' }}
                                visibilityToggle={true}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Mật khẩu mới</Text>}
                            name="newPassword"
                            rules={[
                                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#f39c12' }} />}
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                size="large"
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Xác nhận mật khẩu mới</Text>}
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                    },
                                })
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#f39c12' }} />}
                                placeholder="Nhập lại mật khẩu mới"
                                size="large"
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Item>

                        <Divider />

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                size="large"
                                style={{
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                                    border: 'none',
                                    height: '48px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 15px rgba(253, 203, 110, 0.3)',
                                    color: '#d68910'
                                }}
                                block
                            >
                                <SafetyOutlined /> {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                            </Button>
                        </Form.Item>

                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            backgroundColor: '#fffbf0',
                            borderRadius: '8px',
                            border: '1px solid #ffd591'
                        }}>
                            <Text style={{ fontSize: '13px', color: '#d68910' }}>
                                <SafetyOutlined style={{ marginRight: '6px' }} />
                                <strong>Lưu ý bảo mật:</strong> Sử dụng mật khẩu mạnh với ít nhất 6 ký tự,
                                nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                            </Text>
                        </div>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

const JobByEmail = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);
    const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);

    useEffect(() => {
        const init = async () => {
            await fetchSkill();
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                const d = res.data.skills;
                const arr = d.map((item: any) => {
                    return {
                        label: item.name as string,
                        value: item.id + "" as string
                    }
                });
                form.setFieldValue("skills", arr);
            }
        }
        init();
    }, [])

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;
        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => {
                return {
                    label: item.name as string,
                    value: item.id + "" as string
                }
            }) ?? [];
            setOptionsSkills(arr);
        }
    }

    const onFinish = async (values: any) => {
        const { skills } = values;

        const arr = skills?.map((item: any) => {
            if (item?.id) return { id: item.id };
            return { id: item }
        });

        if (!subscriber?.id) {
            const data = {
                email: user.email,
                name: user.name,
                skills: arr
            }

            const res = await callCreateSubscriber(data);
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            const res = await callUpdateSubscriber({
                id: subscriber?.id,
                skills: arr
            });
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    return (
        <Card
            bordered={false}
            style={{
                background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                borderRadius: '12px'
            }}
        >
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                padding: '32px',
                backdropFilter: 'blur(10px)'
            }}>
                <Space align="center" style={{ marginBottom: '24px' }}>
                    <Avatar
                        size={48}
                        style={{ backgroundColor: '#f39c12' }}
                        icon={<MailOutlined />}
                    />
                    <div>
                        <Title level={3} style={{ margin: 0, color: '#f39c12' }}>
                            Nhận việc qua Email
                        </Title>
                        <Text type="secondary">Đăng ký nhận thông báo việc làm phù hợp</Text>
                    </div>
                </Space>

                <Form onFinish={onFinish} form={form}>
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <Form.Item
                                label={<Text strong style={{ fontSize: '15px' }}>Kỹ năng quan tâm</Text>}
                                name={"skills"}
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 kỹ năng!' }]}
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    size="large"
                                    style={{ borderRadius: '8px' }}
                                    placeholder={
                                        <Space>
                                            <MonitorOutlined style={{ color: '#f39c12' }} />
                                            <Text type="secondary">Chọn kỹ năng bạn quan tâm...</Text>
                                        </Space>
                                    }
                                    optionLabelProp="label"
                                    options={optionsSkills}
                                    maxTagCount={5}
                                    maxTagTextLength={15}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => form.submit()}
                                style={{
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                                    border: 'none',
                                    height: '48px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 15px rgba(253, 203, 110, 0.3)',
                                    color: '#d68910'
                                }}
                                block
                            >
                                <MailOutlined /> Cập nhật đăng ký
                            </Button>
                        </Col>
                    </Row>
                </Form>

                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: '#fffbf0',
                    borderRadius: '8px',
                    border: '1px solid #ffd591'
                }}>
                    <Text style={{ fontSize: '13px', color: '#d68910' }}>
                        <MailOutlined style={{ marginRight: '6px' }} />
                        <strong>Thông tin:</strong> Chúng tôi sẽ gửi email thông báo các công việc
                        phù hợp với kỹ năng bạn đã chọn. Bạn có thể hủy đăng ký bất cứ lúc nào.
                    </Text>
                </div>
            </div>
        </Card>
    );
}

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;

    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps['items'] = [
        {
            key: 'user-resume',
            label: (
                <Space>
                    <FileTextOutlined />
                    <span>Lịch sử ứng tuyển</span>
                </Space>
            ),
            children: <UserResume />,
        },
        {
            key: 'email-by-skills',
            label: (
                <Space>
                    <MailOutlined />
                    <span>Nhận việc qua Email</span>
                </Space>
            ),
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: (
                <Space>
                    <UserOutlined />
                    <span>Thông tin cá nhân</span>
                </Space>
            ),
            children: <UserUpdateInfo />,
        },
        {
            key: 'user-password',
            label: (
                <Space>
                    <SafetyOutlined />
                    <span>Đổi mật khẩu</span>
                </Space>
            ),
            children: <UserChangePassword />,
        },
    ];

    return (
        <>
            <style>
                {`
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Mọi tab (dù active hay không) đều có chữ và icon màu đen */
        .ant-tabs-tab-btn {
            color: black !important;
        }

        .ant-tabs-tab .anticon {
            color: black !important;
        }

        .ant-tabs-nav .ant-tabs-tab {
            margin-right: 16px !important; /* Khoảng cách giữa các tab */
            padding: 10px 24px !important;  /* Tăng padding bên trong để vùng click và màu nền vàng rộng hơn */
            border-radius: 8px 8px 0 0 !important;
            transition: all 0.3s ease-in-out;
        }

        .ant-tabs-tab-active .ant-tabs-tab-btn,
        .ant-tabs-tab-active .anticon {
            color: black !important;
        }

        /* Ẩn gạch chân khi active tab */
        .ant-tabs-ink-bar {
            display: none !important;
        }

        /* Giao diện chung tab */
        .ant-tabs-tab {
            font-weight: 500 !important;
            border-radius: 8px 8px 0 0 !important;
            transition: background 0.3s;
            background-color: transparent !important;
        }

        .ant-tabs-tab-active {
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%) !important;
        }

        /* Modal styles */
        .ant-modal-content {
            border-radius: 16px !important;
            overflow: hidden !important;
        }

        .ant-modal-header {
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%) !important;
            border-bottom: none !important;
            padding: 20px 24px !important;
        }

        .ant-modal-title {
            color: white !important;
            font-size: 18px !important;
            font-weight: 600 !important;
        }

        .ant-modal-close {
            color: black !important;
            font-size: 20px !important;
            font-weight: 900 !important; /* Làm nút X "béo" hơn */
            width: 36px !important;
            height: 36px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 50% !important;
            transition: all 0.3s ease-in-out;
        }
        .ant-modal-close:hover {
            background-color: rgba(0, 0, 0, 0.06) !important; /* nền xám mờ */
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
        }
        `}
            </style>

            <Modal
                title={
                    <Space>
                        <UserOutlined style={{ fontSize: '20px', color: 'black' }} />
                        <span style={{ color: 'black' }}>Quản lý tài khoản</span>
                    </Space>
                }
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1100px"}
                style={{ top: 20 }}
            >
                <div style={{ minHeight: 500, padding: '20px 0' }}>
                    <Tabs
                        defaultActiveKey="user-resume"
                        items={items}
                        onChange={onChange}
                        size="large"
                        tabBarStyle={{
                            marginBottom: '24px',
                            paddingLeft: '8px',
                            paddingRight: '8px'
                        }}
                    />
                </div>
            </Modal>
        </>
    );
}

export default ManageAccount;