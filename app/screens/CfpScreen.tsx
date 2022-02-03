import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { StackedBarChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { StackedBarChartData } from "react-native-chart-kit/dist/StackedBarChart";
import { ActivityIndicator, DataTable, Paragraph, RadioButton, TouchableRipple } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import Colors from "../config/Colors";
import { SpacerV } from "../elements/Spacers";
import { CompactRow, CompactCell } from "../elements/Tables";
import { H1, H3 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { CfpResult } from "../models/CfpResult";
import { getCfpResults } from "../services/ApiService";
import { Session } from "../services/AuthService";
import NotificationService from "../services/NotificationService";
import AppStyles from "../styles/AppStyles";

const DfxCfpNumbers: string[] = [];

const CfpScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [cfpFilter, setCfpFilter] = useState<"all" | "dfx">("all");
  const [cfpResults, setCfpResults] = useState<CfpResult[]>();

  useAuthGuard(session);

  useEffect(() => {
    getCfpResults("2202")
      .then(setCfpResults)
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const getData = (result: CfpResult): StackedBarChartData => {
    return {
      labels: [],
      legend: [
        `${t("cfp.yes")} (${Math.round((result.totalVotes.yes / result.totalVotes.total) * 100)}%)`,
        `${t("cfp.neutral")} (${Math.round((result.totalVotes.neutral / result.totalVotes.total) * 100)}%)`,
        `${t("cfp.no")} (${Math.round((result.totalVotes.no / result.totalVotes.total) * 100)}%)`,
      ],
      data: [[], [result.totalVotes.yes, result.totalVotes.neutral, result.totalVotes.no]],
      barColors: [Colors.Success, Colors.LightGrey, Colors.Error],
    };
  };
  const config: AbstractChartConfig = {
    backgroundColor: Colors.Blue,
    backgroundGradientFrom: Colors.Blue,
    backgroundGradientTo: Colors.Blue,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255,  255,  255,  ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255,  255,  255,  ${opacity})`,
    propsForBackgroundLines: {
      stroke: Colors.Blue,
    },
  };

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <H1 text={t("cfp.title")} />
        <SpacerV height={30} />

        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            {/* <View style={AppStyles.containerHorizontalWrap}>
              <TouchableRipple onPress={() => setCfpFilter("dfx")}>
                <View style={styles.radioRow}>
                  <View pointerEvents="none">
                    <RadioButton value="dfx" status={cfpFilter === "dfx" ? "checked" : "unchecked"} />
                  </View>
                  <Paragraph>{t("cfp.dfx_only")}</Paragraph>
                </View>
              </TouchableRipple>
              <TouchableRipple onPress={() => setCfpFilter("all")}>
                <View style={styles.radioRow}>
                  <View pointerEvents="none">
                    <RadioButton value="all" status={cfpFilter === "all" ? "checked" : "unchecked"} />
                  </View>
                  <Paragraph>{t("cfp.all")}</Paragraph>
                </View>
              </TouchableRipple>
            </View> */}

            <SpacerV height={50} />

            {cfpResults
              ?.filter((r) => cfpFilter === "all" || DfxCfpNumbers.includes(r.number))
              ?.sort((a, b) => a.number - b.number)
              .map((result) => (
                <View key={result.number} style={{ width: "100%" }}>
                  <H3 text={result.title} style={AppStyles.center} />
                  <View style={styles.cfpContainer}>
                    <View>
                      <DataTable style={{ width: 300 }}>
                        <CompactRow>
                          <CompactCell>ID</CompactCell>
                          <CompactCell>#{result.number}</CompactCell>
                        </CompactRow>
                        <CompactRow>
                          <CompactCell>{t("cfp.voting")}</CompactCell>
                          <CompactCell>
                            {result.totalVotes.yes} / {result.totalVotes.neutral} / {result.totalVotes.no}
                          </CompactCell>
                        </CompactRow>
                        <CompactRow>
                          <CompactCell>#{t("cfp.votes")}</CompactCell>
                          <CompactCell>{result.totalVotes.total}</CompactCell>
                        </CompactRow>
                        <CompactRow>
                          <CompactCell>{t("cfp.vote_turnout")}</CompactCell>
                          <CompactCell>{result.totalVotes.turnout}%</CompactCell>
                        </CompactRow>
                        <CompactRow>
                          <CompactCell>{t("cfp.current_result")}</CompactCell>
                          <CompactCell>{t(`cfp.${result.currentResult.toLowerCase()}`)}</CompactCell>
                        </CompactRow>
                      </DataTable>
                    </View>
                    {result.totalVotes.total > 0 && (
                      <View style={styles.chartContainer}>
                        <StackedBarChart
                          data={getData(result)}
                          width={350}
                          height={200}
                          chartConfig={config}
                          hideLegend={false}
                          withHorizontalLabels={false}
                          style={{ marginTop: 5 }}
                        />
                      </View>
                    )}
                  </View>
                  <SpacerV height={50} />
                </View>
              ))}
          </>
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  cfpContainer: {
    flexDirection: "row",
    flexWrap: "wrap-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    width: 250,
    height: 180,
    alignItems: "flex-end",
    overflow: "hidden",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});

export default withSession(CfpScreen);
