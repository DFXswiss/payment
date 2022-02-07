import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { StackedBarChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { StackedBarChartData } from "react-native-chart-kit/dist/StackedBarChart";
import {
  ActivityIndicator,
  DataTable,
  Paragraph,
  RadioButton,
  TouchableRipple,
  Text,
  IconButton,
} from "react-native-paper";
import AppLayout from "../components/AppLayout";
import Loading from "../components/util/Loading";
import Colors from "../config/Colors";
import { DeFiButton } from "../elements/Buttons";
import { SpacerV } from "../elements/Spacers";
import { CompactRow, CompactCell } from "../elements/Tables";
import { H1, H3 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { CfpResult } from "../models/CfpResult";
import { CfpVote, CfpVotes } from "../models/User";
import { getCfpResults, getCfpVotes, getIsVotingOpen, getStakingRoutes, putCfpVotes } from "../services/ApiService";
import { Session } from "../services/AuthService";
import NotificationService from "../services/NotificationService";
import AppStyles from "../styles/AppStyles";
import { openUrl } from "../utils/Utils";

const DfxCfpNumbers: number[] = [];

interface RadioButtonProps {
  label: string;
  onPress: () => void;
  checked: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const DfxRadioButton = ({ label, onPress, checked, disabled, loading }: RadioButtonProps) => {
  return (
    <TouchableRipple onPress={onPress} disabled={disabled}>
      <View style={styles.radioRow}>
        <View pointerEvents="none">
          {loading ? (
            <Loading size={20} style={{ marginRight: 16 }} />
          ) : (
            <RadioButton value="dfx" status={checked ? "checked" : "unchecked"} disabled={disabled} />
          )}
        </View>
        <Paragraph>{label}</Paragraph>
      </View>
    </TouchableRipple>
  );
};

const CfpScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [cfpFilter, setCfpFilter] = useState<"all" | "dfx">("all");
  const [cfpResults, setCfpResults] = useState<CfpResult[]>();
  const [canVote, setCanVote] = useState(false);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [votes, setVotes] = useState<CfpVotes | undefined>();
  const [isSaving, setIsSaving] = useState<{ number: Number; vote: CfpVote } | undefined>();

  useAuthGuard(session);

  useEffect(() => {
    Promise.all([getCfpResults("2202"), getCfpVotes(), getStakingRoutes(), getIsVotingOpen()])
      .then(([results, votes, stakingRoutes, votingOpen]) => {
        setCfpResults(results);
        setVotes(votes);
        setCanVote(stakingRoutes.find((r) => r.balance >= 100) != null);
        setIsVotingOpen(votingOpen);
      })
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

  const onVote = (number: number, vote: CfpVote) => {
    setVotes((votes) => {
      votes = { ...(votes ?? {}), [number]: vote };

      setIsSaving({ number, vote });
      putCfpVotes(votes).finally(() => setIsSaving(undefined));

      return votes;
    });
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

                  <DeFiButton onPress={() => openUrl(result.htmlUrl)} compact>
                    {t("cfp.read_proposal")}
                  </DeFiButton>

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

                  {canVote && (
                    <>
                      <SpacerV />
                      <Text style={[AppStyles.center, AppStyles.b]}>{t("cfp.your_vote")}</Text>
                      <View style={[AppStyles.containerHorizontalWrap, styles.voteContainer]}>
                        <DfxRadioButton
                          label={t("cfp.yes")}
                          onPress={() => onVote(result.number, CfpVote.YES)}
                          checked={votes?.[result.number] === CfpVote.YES}
                          disabled={!isVotingOpen}
                          loading={isSaving?.number === result.number && isSaving.vote === CfpVote.YES}
                        />
                        <DfxRadioButton
                          label={t("cfp.no")}
                          onPress={() => onVote(result.number, CfpVote.NO)}
                          checked={votes?.[result.number] === CfpVote.NO}
                          disabled={!isVotingOpen}
                          loading={isSaving?.number === result.number && isSaving.vote === CfpVote.NO}
                        />
                        <DfxRadioButton
                          label={t("cfp.neutral")}
                          onPress={() => onVote(result.number, CfpVote.NEUTRAL)}
                          checked={(votes?.[result.number] ?? CfpVote.NEUTRAL) === CfpVote.NEUTRAL}
                          disabled={!isVotingOpen}
                          loading={isSaving?.number === result.number && isSaving.vote === CfpVote.NEUTRAL}
                        />
                      </View>
                    </>
                  )}

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
  voteContainer: {
    justifyContent: "center",
  },
});

export default withSession(CfpScreen);
