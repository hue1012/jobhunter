import { callFetchCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Card, Col, Divider, Empty, Pagination, Row, Spin, Tooltip } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import appStyles from 'styles/app.module.scss';

interface IProps {
    showPagination?: boolean;
}

const CompanyCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize, filter, sortQuery]);

    const fetchCompany = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchCompany(query);
        if (res && res.data) {
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }


    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/company/${slug}?id=${item.id}`)
        }
    }

    return (
        <div className={`${styles["company-section"]}`}>
            <div className={styles["company-content"]}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={`${styles["title"]} ${appStyles["enhanced-title-vietnamese"]} ${appStyles["sparkle-title"]} ${appStyles["vietnamese-gradient-text"]}`} style={{
                                    fontSize: '28px',
                                    fontWeight: '800',
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    letterSpacing: '0.5px',
                                    position: 'relative',
                                    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
                                }}>
                                    🏢 Nhà Tuyển Dụng Hàng Đầu
                                </span>
                                {!showPagination &&
                                    <Link to="company" className={appStyles["view-all-link-company"]}>
                                        Xem tất cả
                                    </Link>
                                }
                            </div>
                        </Col>

                        {displayCompany?.map(item => {
                            return (
                                <Col span={24} md={12} lg={6} key={item.id}>
                                    <Card
                                        onClick={() => handleViewDetailJob(item)}
                                        style={{ 
                                            height: 350,
                                            cursor: 'pointer'
                                        }}
                                        hoverable
                                        cover={
                                            <div className={styles["card-customize"]} >
                                                <img
                                                    alt={item.name}
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.logo}`}
                                                />
                                            </div>
                                        }
                                    >
                                        <Divider />
                                        <Tooltip title={item.name} placement="top">
                                            <h3 style={{ 
                                                textAlign: "center", 
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                margin: "0 10px",
                                                fontSize: "16px",
                                                fontWeight: "600",
                                                color: "#1f2937",
                                                lineHeight: "1.5"
                                            }}>
                                                {item.name}
                                            </h3>
                                        </Tooltip>
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayCompany || displayCompany && displayCompany.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && <>
                        <div style={{ marginTop: 30 }}></div>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            />
                        </Row>
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default CompanyCard;