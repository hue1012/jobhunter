import { useAppSelector } from "@/redux/hooks";
import { IJob } from "@/types/backend";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import {
    Button,
    Col,
    ConfigProvider,
    Divider,
    Modal,
    Row,
    Upload,
    message,
    notification,
    Card,
    Typography,
    Space
} from "antd";
import { useNavigate } from "react-router-dom";
import enUS from 'antd/lib/locale/en_US';
import {
    UploadOutlined,
    UserOutlined,
    MailOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    BookOutlined,
    SettingOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { callCreateResume, callUploadSingleFile } from "@/config/api";
import { useState } from 'react';

const { Title, Text } = Typography;

interface IProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    jobDetail: IJob | null;
}

const ApplyModal = (props: IProps) => {
    const { isModalOpen, setIsModalOpen, jobDetail } = props;
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [urlCV, setUrlCV] = useState<string>("");

    const navigate = useNavigate();

    const handleOkButton = async () => {
        if (!urlCV && isAuthenticated) {
            message.error("Vui lòng tải CV lên!");
            return;
        }

        if (!isAuthenticated) {
            setIsModalOpen(false);
            navigate(`/login?callback=${window.location.href}`)
        }
        else {

            if (jobDetail) {
                const res = await callCreateResume(urlCV, jobDetail?.id, user.email, user.id);
                if (res.data) {
                    message.success("Ứng tuyển thành công thành công!");
                    setIsModalOpen(false);
                } else {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res.message
                    });
                }
            }
        }
    }

    const propsUpload: UploadProps = {
        maxCount: 1,
        multiple: false,
        accept: "application/pdf,application/msword, .doc, .docx, .pdf",
        async customRequest({ file, onSuccess, onError }: any) {
            const res = await callUploadSingleFile(file, "resume");
            if (res && res.data) {
                setUrlCV(res.data.fileName);
                if (onSuccess) onSuccess('ok')
            } else {
                if (onError) {
                    setUrlCV("");
                    const error = new Error(res.message);
                    onError({ event: error });
                }
            }
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                // console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`✅ ${info.file.name} - Tải lên thành công!`);
            } else if (info.file.status === 'error') {
                message.error(`❌ ${info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi tải file lên."}`)
            }
        },
    };


    return (
        <>
            <Modal
                title={
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        margin: '-24px -24px 0 -24px',
                        padding: '20px 24px',
                        color: 'white',
                        borderRadius: '8px 8px 0 0'
                    }}>
                        <Space align="center" size="middle">
                            <BookOutlined style={{ fontSize: '24px' }} />
                            <div>
                                <Title level={4} style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '700' }}>
                                    🚀 Ứng Tuyển Công Việc
                                </Title>
                                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                                    Hoàn thành thông tin để ứng tuyển ngay
                                </Text>
                            </div>
                        </Space>
                    </div>
                }
                open={isModalOpen}
                onOk={() => handleOkButton()}
                onCancel={() => setIsModalOpen(false)}
                maskClosable={false}
                okText={
                    <Space>
                        {isAuthenticated ? <CheckCircleOutlined /> : <UserOutlined />}
                        {isAuthenticated ? "🎯 Gửi Đơn Ứng Tuyển" : "🔐 Đăng Nhập Ngay"}
                    </Space>
                }
                cancelButtonProps={
                    { style: { display: "none" } }
                }
                okButtonProps={{
                    style: {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderColor: 'transparent',
                        height: '44px',
                        fontWeight: '600',
                        fontSize: '15px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }
                }}
                destroyOnClose={true}
                width={600}
                centered
                style={{
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}
            >
                <div style={{ padding: '20px 0' }}>
                    {isAuthenticated ?
                        <Card
                            style={{
                                borderRadius: '12px',
                                border: '1px solid #e8f4f8',
                                background: 'linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{ padding: '24px' }}
                        >
                            {/* Job Info Header */}
                            <Card
                                style={{
                                    marginBottom: '24px',
                                    borderRadius: '10px',
                                    border: '1px solid #e0e7ff',
                                    background: 'white'
                                }}
                                bodyStyle={{ padding: '20px' }}
                            >
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '8px'
                                    }}>
                                        <BookOutlined style={{
                                            fontSize: '20px',
                                            color: '#6366f1',
                                            background: 'linear-gradient(135deg, #f0f4ff, #e8f0ff)',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e7ff'
                                        }} />
                                        <Title level={5} style={{
                                            margin: 0,
                                            color: '#1f2937',
                                            fontSize: '16px',
                                            fontWeight: '600'
                                        }}>
                                            💼 Thông Tin Công Việc
                                        </Title>
                                    </div>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #f0f4ff, #e8f0ff)',
                                        padding: '16px',
                                        borderRadius: '10px',
                                        border: '1px solid #e0e7ff'
                                    }}>
                                        <Text style={{
                                            fontSize: '15px',
                                            lineHeight: '1.6',
                                            color: '#374151'
                                        }}>
                                            Bạn đang ứng tuyển vị trí <strong style={{ color: '#6366f1' }}>{jobDetail?.name}</strong> tại công ty <strong style={{ color: '#8b5cf6' }}>{jobDetail?.company?.name}</strong>
                                        </Text>
                                    </div>
                                </Space>
                            </Card>

                            <ConfigProvider locale={enUS}>
                                <ProForm
                                    submitter={{
                                        render: () => <></>
                                    }}
                                >
                                    <Row gutter={[0, 24]}>
                                        <Col span={24}>
                                            <div style={{
                                                background: 'white',
                                                padding: '20px',
                                                borderRadius: '10px',
                                                border: '1px solid #e0e7ff'
                                            }}>
                                                <Space align="center" style={{ marginBottom: '16px' }}>
                                                    <MailOutlined style={{
                                                        fontSize: '18px',
                                                        color: '#6366f1',
                                                        background: 'linear-gradient(135deg, #f0f4ff, #e8f0ff)',
                                                        padding: '6px',
                                                        borderRadius: '6px'
                                                    }} />
                                                    <Text strong style={{ color: '#1f2937', fontSize: '15px' }}>
                                                        📧 Email Liên Hệ
                                                    </Text>
                                                </Space>
                                                <ProFormText
                                                    fieldProps={{
                                                        type: "email",
                                                        style: {
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            padding: '12px',
                                                            background: '#f8faff',
                                                            border: '1px solid #e0e7ff'
                                                        }
                                                    }}
                                                    name={"email"}
                                                    disabled
                                                    initialValue={user?.email}
                                                    placeholder="Email của bạn"
                                                />
                                            </div>
                                        </Col>
                                        <Col span={24}>
                                            <div style={{
                                                background: 'white',
                                                padding: '20px',
                                                borderRadius: '10px',
                                                border: '1px solid #e0e7ff'
                                            }}>
                                                <Space align="center" style={{ marginBottom: '16px' }}>
                                                    <FileTextOutlined style={{
                                                        fontSize: '18px',
                                                        color: '#8b5cf6',
                                                        background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                                                        padding: '6px',
                                                        borderRadius: '6px'
                                                    }} />
                                                    <Text strong style={{ color: '#1f2937', fontSize: '15px' }}>
                                                        📄 Tài Liệu CV
                                                    </Text>
                                                </Space>
                                                <ProForm.Item
                                                    rules={[{ required: true, message: '⚠️ Vui lòng tải CV lên để hoàn tất ứng tuyển!' }]}
                                                >
                                                    <Upload
                                                        {...propsUpload}
                                                        listType="picture-card"
                                                        showUploadList={{
                                                            showPreviewIcon: true,
                                                            showRemoveIcon: true,
                                                            showDownloadIcon: false,
                                                        }}
                                                    >
                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            padding: '20px',
                                                            minHeight: '120px',
                                                            background: 'linear-gradient(135deg, #f8faff, #f1f5f9)',
                                                            border: '2px dashed #c7d2fe',
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}>
                                                            <UploadOutlined style={{
                                                                fontSize: '32px',
                                                                color: '#6366f1',
                                                                marginBottom: '12px'
                                                            }} />
                                                            <div style={{ textAlign: 'center' }}>
                                                                <Text strong style={{
                                                                    color: '#1f2937',
                                                                    fontSize: '15px',
                                                                    display: 'block',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    📁 Tải CV lên tại đây
                                                                </Text>
                                                                <Text style={{
                                                                    color: '#6b7280',
                                                                    fontSize: '13px',
                                                                    lineHeight: '1.4'
                                                                }}>
                                                                    Hỗ trợ: PDF, DOC, DOCX<br />
                                                                    Kích thước tối đa: 5MB
                                                                </Text>
                                                            </div>
                                                        </div>
                                                    </Upload>
                                                </ProForm.Item>
                                            </div>
                                        </Col>
                                    </Row>
                                </ProForm>
                            </ConfigProvider>
                        </Card>
                        :
                        <Card
                            style={{
                                borderRadius: '12px',
                                border: '1px solid #fef3c7',
                                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                                textAlign: 'center'
                            }}
                            bodyStyle={{ padding: '40px 24px' }}
                        >
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div style={{
                                    fontSize: '48px',
                                    marginBottom: '16px'
                                }}>
                                    🔐
                                </div>
                                <div>
                                    <Title level={4} style={{
                                        color: '#92400e',
                                        margin: '0 0 12px 0',
                                        fontSize: '20px',
                                        fontWeight: '700'
                                    }}>
                                        Cần Đăng Nhập
                                    </Title>
                                    <Text style={{
                                        fontSize: '15px',
                                        color: '#78350f',
                                        lineHeight: '1.6'
                                    }}>
                                        Bạn cần đăng nhập vào hệ thống để có thể ứng tuyển vào vị trí này.<br />
                                        Hãy nhấn nút bên dưới để đăng nhập ngay!
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    }
                </div>
            </Modal>
        </>
    )
}
export default ApplyModal;
