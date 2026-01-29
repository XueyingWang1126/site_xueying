/**
 * Experience domain model.
 * Holds company information and bullet points.
 */
package com.xueying.model;

import java.util.List;

public class Experience {
    private String company;
    private String role;
    private String period;
    private String icon;      // 新增：图标路径
    private String url;       // 新增：可选跳转链接
    private List<String> bullets;

    public Experience(String company,
                      String role,
                      String period,
                      String icon,
                      String url,
                      List<String> bullets) {
        this.company = company;
        this.role    = role;
        this.period  = period;
        this.icon    = icon;
        this.url     = url;
        this.bullets = bullets;
    }

    // getters
    public String getCompany()   { return company; }
    public String getRole()      { return role; }
    public String getPeriod()    { return period; }
    public String getIcon()      { return icon; }
    public String getUrl()       { return url; }
    public List<String> getBullets() { return bullets; }
}
