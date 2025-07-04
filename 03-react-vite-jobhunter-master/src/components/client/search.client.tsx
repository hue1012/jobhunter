import { Button, Col, Form, Row, Select, notification, Input } from 'antd';
import { EnvironmentOutlined, MonitorOutlined, SearchOutlined, RocketOutlined } from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllSkill } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const SearchClient = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (location.search) {
            const queryLocation = searchParams.get("location");
            const querySkills = searchParams.get("skills")
            if (queryLocation) {
                form.setFieldValue("location", queryLocation.split(","))
            }
            if (querySkills) {
                form.setFieldValue("skills", querySkills.split(","))
            }
        }
    }, [location.search])

    useEffect(() => {
        fetchSkill();
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
        let query = "";
        if (values?.location?.length) {
            query = `location=${values?.location?.join(",")}`;
        }
        if (values?.skills?.length) {
            query = values.location?.length ? query + `&skills=${values?.skills?.join(",")}`
                :
                `skills=${values?.skills?.join(",")}`;
        }

        if (!query) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: "Vui lòng chọn tiêu chí để search"
            });
            return;
        }
        navigate(`/job?${query}`);
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '0'
        }}>
            <ProForm
                form={form}
                onFinish={onFinish}
                submitter={{
                    render: () => <></>
                }}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col span={24} md={12}>
                        <div style={{
                            position: 'relative',
                            background: 'linear-gradient(135deg, #f8faff, #f1f5f9)',
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            overflow: 'hidden'
                        }}>
                            <ProForm.Item
                                name="skills"
                                style={{ margin: 0 }}
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    size="large"
                                    style={{
                                        width: '100%',
                                        border: 'none'
                                    }}
                                    placeholder="🚀 Nhập kỹ năng (React, Node.js, Python...)"
                                    optionLabelProp="label"
                                    options={optionsSkills}
                                    suffixIcon={<MonitorOutlined style={{ color: '#6366f1', fontSize: '16px' }} />}
                                    dropdownStyle={{
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                    }}
                                    tagRender={(props) => {
                                        const { label, closable, onClose } = props;
                                        return (
                                            <span
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    margin: '2px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                {label}
                                                {closable && (
                                                    <span
                                                        onClick={onClose}
                                                        style={{
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            opacity: 0.8
                                                        }}
                                                    >
                                                        ×
                                                    </span>
                                                )}
                                            </span>
                                        );
                                    }}
                                />
                            </ProForm.Item>
                        </div>
                    </Col>

                    <Col span={24} md={6}>
                        <div style={{
                            position: 'relative',
                            background: 'linear-gradient(135deg, #f8faff, #f1f5f9)',
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            overflow: 'hidden'
                        }}>
                            <ProForm.Item
                                name="location"
                                style={{ margin: 0 }}
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    size="large"
                                    style={{
                                        width: '100%',
                                        border: 'none'
                                    }}
                                    placeholder="📍 Chọn địa điểm"
                                    optionLabelProp="label"
                                    options={optionsLocations}
                                    suffixIcon={<EnvironmentOutlined style={{ color: '#10b981', fontSize: '16px' }} />}
                                    dropdownStyle={{
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                    }}
                                    tagRender={(props) => {
                                        const { label, closable, onClose } = props;
                                        return (
                                            <span
                                                style={{
                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    margin: '2px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                {label}
                                                {closable && (
                                                    <span
                                                        onClick={onClose}
                                                        style={{
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            opacity: 0.8
                                                        }}
                                                    >
                                                        ×
                                                    </span>
                                                )}
                                            </span>
                                        );
                                    }}
                                />
                            </ProForm.Item>
                        </div>
                    </Col>

                    <Col span={24} md={6}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<SearchOutlined />}
                            onClick={() => form.submit()}
                            style={{
                                width: '100%',
                                height: '56px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderColor: 'transparent',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '700',
                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
                            }}
                        >
                            Tìm Kiếm
                        </Button>
                    </Col>
                </Row>
            </ProForm>
        </div>
    )
}
export default SearchClient;