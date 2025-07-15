import { useAppSelector } from "@/redux/hooks";
import { IJob } from "@/types/backend";
import { ProForm, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
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
    SettingOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { callCreateResume, callUploadSingleFile } from "@/config/api";
import { useState } from 'react';
import styles from '@/styles/apply-modal.module.scss';

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
            message.error({
                content: "⚠️ Vui lòng tải CV lên để hoàn tất ứng tuyển!",
                style: {
                    marginTop: '10vh',
                },
                duration: 4,
            });
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
                    message.success({
                        content: "🎉 Ứng tuyển thành công! Chúc bạn may mắn!",
                        style: {
                            marginTop: '10vh',
                        },
                        duration: 5,
                    });
                    setIsModalOpen(false);
                } else {
                    notification.error({
                        message: '❌ Có lỗi xảy ra',
                        description: res.message,
                        placement: 'topRight',
                        style: {
                            marginTop: '60px'
                        }
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
                message.success({
                    content: `✅ ${info.file.name} - Tải lên thành công!`,
                    style: {
                        marginTop: '10vh',
                    },
                    duration: 3,
                });
            } else if (info.file.status === 'error') {
                message.error({
                    content: `❌ ${info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi tải file lên."}`,
                    style: {
                        marginTop: '10vh',
                    },
                    duration: 4,
                });
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
                        padding: '24px',
                        color: 'white',
                        borderRadius: '8px 8px 0 0',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Background decoration */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            transform: 'translate(30px, -30px)'
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '60px',
                            height: '60px',
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: '50%',
                            transform: 'translate(-20px, 20px)'
                        }} />

                        <Space align="center" size="middle" style={{ position: 'relative', zIndex: 1 }}>
                            {/* Icon cái cặp bằng CSS */}
                            <div style={{
                                width: '40px',
                                height: '40px',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '22px',
                                    background: 'white',
                                    borderRadius: '3px',
                                    position: 'relative',
                                    boxShadow: 'inset 0 2px 0 rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    width: '16px',
                                    height: '4px',
                                    border: '2px solid white',
                                    borderBottom: 'none',
                                    borderRadius: '8px 8px 0 0',
                                    top: '8px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'transparent'
                                }} />
                            </div>
                            <div>
                                <Title level={4} style={{
                                    color: 'white',
                                    margin: 0,
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    🚀 Ứng Tuyển Công Việc
                                </Title>
                                <Text style={{
                                    color: 'rgba(255,255,255,0.9)',
                                    fontSize: '14px',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}>
                                    Hoàn thành thông tin để ứng tuyển ngay
                                </Text>
                            </div>
                        </Space>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={900}
                centered
                style={{
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}
                styles={{
                    body: { padding: '0' },
                    footer: {
                        borderTop: '1px solid #f0f0f0',
                        padding: '16px 24px',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)'
                    }
                }}
            >
                <div style={{ padding: '24px', paddingBottom: '0' }}>
                    {isAuthenticated ?
                        <Card
                            style={{
                                borderRadius: '16px',
                                border: '1px solid #e8f4f8',
                                background: 'linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                            }}
                            bodyStyle={{ padding: '28px' }}
                        >
                            {/* Job Info Header */}
                            <Card
                                className={styles['job-info-card']}
                                style={{
                                    marginBottom: '28px',
                                    borderRadius: '12px',
                                    border: '1px solid #e0e7ff',
                                    background: 'white',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                }}
                                bodyStyle={{ padding: '24px' }}
                            >
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '12px'
                                    }}>
                                        {/* Icon cái cặp bằng CSS */}
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #f0f4ff, #e8f0ff)',
                                            borderRadius: '12px',
                                            border: '1px solid #e0e7ff'
                                        }}>
                                            <div style={{
                                                width: '24px',
                                                height: '16px',
                                                background: '#6366f1',
                                                borderRadius: '2px',
                                                position: 'relative',
                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)'
                                            }} />
                                            <div style={{
                                                position: 'absolute',
                                                width: '12px',
                                                height: '3px',
                                                border: '1.5px solid #6366f1',
                                                borderBottom: 'none',
                                                borderRadius: '6px 6px 0 0',
                                                top: '12px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: 'transparent'
                                            }} />
                                        </div>
                                        <Title level={5} style={{
                                            margin: 0,
                                            color: '#1f2937',
                                            fontSize: '18px',
                                            fontWeight: '700'
                                        }}>
                                            💼 Thông Tin Công Việc
                                        </Title>
                                    </div>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #f0f4ff, #e8f0ff)',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid #e0e7ff',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Background decoration */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-10px',
                                            right: '-10px',
                                            width: '40px',
                                            height: '40px',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            borderRadius: '50%'
                                        }} />
                                        <Text style={{
                                            fontSize: '16px',
                                            lineHeight: '1.7',
                                            color: '#374151',
                                            position: 'relative',
                                            zIndex: 1,
                                            display: 'block'
                                        }}>
                                            Bạn đang ứng tuyển vị trí <strong style={{
                                                color: '#6366f1',
                                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                fontWeight: '700'
                                            }}>{jobDetail?.name}</strong> tại công ty <strong style={{
                                                color: '#8b5cf6',
                                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                fontWeight: '700'
                                            }}>{jobDetail?.company?.name}</strong>
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
                                    <Row gutter={[24, 28]}>
                                        <Col span={12}>
                                            <div
                                                className={styles['form-section']}
                                                style={{
                                                    background: 'white',
                                                    padding: '24px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e0e7ff',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                                }}
                                            >
                                                <Space align="center" style={{ marginBottom: '20px' }}>
                                                    <MailOutlined style={{
                                                        fontSize: '20px',
                                                        color: '#6366f1',
                                                        background: 'linear-gradient(135deg, #f0f4ff, #e8f0ff)',
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e0e7ff'
                                                    }} />
                                                    <Text strong style={{
                                                        color: '#1f2937',
                                                        fontSize: '16px',
                                                        fontWeight: '700'
                                                    }}>
                                                        📧 Email Liên Hệ
                                                    </Text>
                                                </Space>
                                                <ProFormText
                                                    fieldProps={{
                                                        type: "email",
                                                        style: {
                                                            borderRadius: '10px',
                                                            fontSize: '15px',
                                                            padding: '14px 16px',
                                                            background: '#f8faff',
                                                            border: '2px solid #e0e7ff',
                                                            fontWeight: '500'
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
                                            <div
                                                className={styles['form-section']}
                                                style={{
                                                    background: 'white',
                                                    padding: '24px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e0e7ff',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                                }}
                                            >
                                                <Space align="center" style={{ marginBottom: '20px' }}>
                                                    <PhoneOutlined style={{
                                                        fontSize: '20px',
                                                        color: '#10b981',
                                                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #bbf7d0'
                                                    }} />
                                                    <Text strong style={{
                                                        color: '#1f2937',
                                                        fontSize: '16px',
                                                        fontWeight: '700'
                                                    }}>
                                                        📞 Thông Tin Liên Hệ
                                                    </Text>
                                                </Space>
                                                <ProFormTextArea
                                                    fieldProps={{
                                                        style: {
                                                            borderRadius: '10px',
                                                            fontSize: '15px',
                                                            padding: '14px 16px',
                                                            background: '#f8faff',
                                                            border: '2px solid #e0e7ff',
                                                            fontWeight: '500',
                                                            minHeight: '100px',
                                                            resize: 'vertical'
                                                        },
                                                        autoSize: { minRows: 4, maxRows: 8 }
                                                    }}
                                                    name={"contactInfo"}
                                                    placeholder="Vui lòng nhập thông tin liên hệ của bạn (số điện thoại, địa chỉ, các kỹ năng nổi bật...)"
                                                    rules={[
                                                        { required: true, message: '⚠️ Vui lòng nhập thông tin liên hệ!' },
                                                        { min: 10, message: '📝 Thông tin liên hệ quá ngắn (tối thiểu 10 ký tự)!' }
                                                    ]}
                                                />
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div
                                                className={styles['form-section']}
                                                style={{
                                                    background: 'white',
                                                    padding: '24px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e0e7ff',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                                }}
                                            >
                                                <Space align="center" style={{ marginBottom: '20px' }}>
                                                    <FileTextOutlined style={{
                                                        fontSize: '20px',
                                                        color: '#8b5cf6',
                                                        background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e9d5ff'
                                                    }} />
                                                    <Text strong style={{
                                                        color: '#1f2937',
                                                        fontSize: '16px',
                                                        fontWeight: '700'
                                                    }}>
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
                                                        <div
                                                            className={styles['upload-area']}
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: '24px',
                                                                minHeight: '140px',
                                                                background: 'linear-gradient(135deg, #f8faff, #f1f5f9)',
                                                                border: '3px dashed #c7d2fe',
                                                                borderRadius: '16px',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s ease',
                                                                position: 'relative',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            {/* Background decoration */}
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '-20px',
                                                                right: '-20px',
                                                                width: '60px',
                                                                height: '60px',
                                                                background: 'rgba(99, 102, 241, 0.1)',
                                                                borderRadius: '50%'
                                                            }} />
                                                            <UploadOutlined
                                                                className={styles['upload-icon']}
                                                                style={{
                                                                    fontSize: '36px',
                                                                    color: '#6366f1',
                                                                    marginBottom: '16px',
                                                                    position: 'relative',
                                                                    zIndex: 1,
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                            />
                                                            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                                                <Text
                                                                    strong
                                                                    className={styles['upload-text']}
                                                                    style={{
                                                                        color: '#1f2937',
                                                                        fontSize: '16px',
                                                                        display: 'block',
                                                                        marginBottom: '6px',
                                                                        fontWeight: '700',
                                                                        transition: 'color 0.3s ease'
                                                                    }}
                                                                >
                                                                    📁 Tải CV lên tại đây
                                                                </Text>
                                                                <Text style={{
                                                                    color: '#6b7280',
                                                                    fontSize: '14px',
                                                                    lineHeight: '1.5'
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
                                borderRadius: '16px',
                                border: '1px solid #fef3c7',
                                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            bodyStyle={{ padding: '48px 32px' }}
                        >
                            {/* Background decoration */}
                            <div style={{
                                position: 'absolute',
                                top: '-30px',
                                right: '-30px',
                                width: '100px',
                                height: '100px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '50%'
                            }} />
                            <div style={{
                                position: 'absolute',
                                bottom: '-20px',
                                left: '-20px',
                                width: '60px',
                                height: '60px',
                                background: 'rgba(245, 158, 11, 0.08)',
                                borderRadius: '50%'
                            }} />

                            <Space direction="vertical" size="large" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    fontSize: '56px',
                                    marginBottom: '20px',
                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                                }}>
                                    🔐
                                </div>
                                <div>
                                    <Title level={4} style={{
                                        color: '#92400e',
                                        margin: '0 0 16px 0',
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        Cần Đăng Nhập
                                    </Title>
                                    <Text style={{
                                        fontSize: '16px',
                                        color: '#78350f',
                                        lineHeight: '1.7',
                                        display: 'block'
                                    }}>
                                        Bạn cần đăng nhập vào hệ thống để có thể ứng tuyển vào vị trí này.<br />
                                        <strong>Hãy nhấn nút bên dưới để đăng nhập ngay!</strong>
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    }

                    {/* Custom Button */}
                    <div style={{
                        marginTop: '24px',
                        textAlign: 'center',
                        padding: '16px 0',
                        borderTop: '1px solid #f0f0f0',
                        background: 'rgba(255,255,255,0.95)'
                    }}>
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => handleOkButton()}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderColor: 'transparent',
                                height: '48px',
                                fontWeight: '600',
                                fontSize: '16px',
                                borderRadius: '12px',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease',
                                minWidth: '200px'
                            }}
                        >
                            <Space>
                                {isAuthenticated ? <CheckCircleOutlined /> : <UserOutlined />}
                                {isAuthenticated ? "🎯 Gửi Đơn Ứng Tuyển" : "🔐 Đăng Nhập Ngay"}
                            </Space>
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
export default ApplyModal;
