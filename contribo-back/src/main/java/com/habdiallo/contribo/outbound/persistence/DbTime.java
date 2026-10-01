package com.habdiallo.contribo.outbound.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public final class DbTime {

    private DbTime() {
    }

    public static OffsetDateTime offsetDateTime(ResultSet resultSet, String column) throws SQLException {
        return resultSet.getTimestamp(column).toInstant().atOffset(ZoneOffset.UTC);
    }
}
